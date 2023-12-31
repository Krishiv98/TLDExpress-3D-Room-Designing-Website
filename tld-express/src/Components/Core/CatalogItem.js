import React, { Component } from 'react';
import { Vector2 } from 'three';
import { Box, Image, Text, VStack } from '@chakra-ui/react';
import { KeepCabinetInsideWall, triggerCollisionCheck } from '../../Utilities/Position';

export const CONVERSION = 3.28084

/**
 * This Class is a catalog item and handles the data of the cabinet to be added 
 */
export default class CatalogItem extends Component{

    cabinet;
    
    /**
     * This will take a Cabinet as a prop and grab the entry from the database
     */
     constructor(props){
        super(props);
        this.itemDragStartHandler = this.itemDragStartHandler.bind(this);
        this.state = {
            catalogUI: this.props.catalogUI
        }
        this.cabinet = this.props.cabinet;
        
    }

    /**
     * This will handle the dragg of the item, they click and drag the item
     */
    itemDragStartHandler(){
        this.setAsCatalogSelection(this)
    }


    //This method will handle the initial mouseDown and will change the selectionkj;w
    itemDragEndHandler = async (event) => {
        const room = this.props.Room
        
        //Get mouse position and create a vector 2
        let mousex = (event.clientX / window.innerWidth) * 2 - 1;
        let mousey = -(event.clientY / window.innerHeight) * 2 + 1;
        let position = new Vector2(mousex,mousey)

        //Get refs to camera and raycaster
        let cam = room.cameraRef.current;
        let ray = room.rayRef.current;
        //Set raycaster to be from camera to mouse position
        ray.setFromCamera(position,cam)
        
        //list of collodable objects 
       
        //Based from the list of wall made in the room, we grab them uniquely to determine which wall does the raycaster has intersected with.
        const collidedWalls = [...new Set(room.RoomRenderRef.current.state.wallArrayList.current)];
        collidedWalls.pop(); // We popped out the null that the collided walls has created for some reason
        const objectCollisionList = [...collidedWalls, room.RoomRenderRef.current.floorRef.current]
        //Get list of intersecting objects
        const intersections = ray.intersectObjects(objectCollisionList)
        // We determined what wall that the cabinet has attached into!
        let findWallIntersect = null
        // Find the last non-floor object 
        for(let i = 0; i < intersections.length; i++){
            if(intersections[i].object.name !== "floor"){
                findWallIntersect = intersections[i]
            }
        }
        const intersectedWall = findWallIntersect
        // If no wall found show error
        // else attach to wall and update entity list
        if(findWallIntersect === null){
            console.error("NO WALL FOUND")
        }
        else{
            this.cabinet.measure = {
                "height": this.cabinet.cabHeight/12,
                "width": this.cabinet.cabWidth/12,
                "depth": this.cabinet.cabDepth/12,
            }
            let newCab = attachToWall(intersectedWall, this.cabinet, room) // Updates the Cabinet

            room.setState({entityList: [...room.state.entityList, newCab]})        
            this.setAsCatalogSelection(null)
            
        }

        //Set position of this cabinet based on first intersectoin
        
        // To avoid duplication issue and the inheritance of the most recent properties,
        // this is needed to make sure that a cabinet instance is unique AND not based
        // on what we had on the entityList
        setTimeout(()=>{room.forceUpdate();room.forceUpdate()},200); // Reset the room after a timer to allow snapping to complete before checking collision. Twice to correct toggles.
    }

    /**
    * The item realease handler will handle the release of the item that is to be added to the screen
    * We will need to track the catalog 
    */
    itemReleaseHandler = () => {
        
    }

    setAsCatalogSelection(obj){
        this.state.catalogUI.state.currentSelection = obj
    }

    /**
     * This will hold the return object to render, including onDrag/ onRelease item handlers
     * and the path of the model
     */
    render (){
        return (
            <Box draggable="true" id={Math.random()}
            onDragEnd={(e)=>{this.itemDragEndHandler(e)}}
            onDragStart={(e)=>{this.itemDragStartHandler(e)}}
            width={'auto'}
            backgroundColor={'white'}
            padding={'10px'}
            marginY={'15px'}
            style={{borderRadius: "20px", boxShadow: "5px 5px 5px" }} className={'individualItem'}>
                <VStack>
                        <Image boxSize='100px' objectFit='cover' src={this.cabinet.photoPath} borderRadius='full'/>
                        <Text fontSize='lg' as='b'>
                            {this.cabinet.cabName}
                        </Text>
                </VStack>
            </Box>
        );
    }
}

/**
 * /**
 * This method will be used to determine the wall that the chosen cabinet will be rendered on connected with in the database.
 * @param [] intersections 
 * @returns The wall number of the wall that the ray caster pointed through.
 */
export function attachToWall(intersectedWall, cabinet, room) {
    
    //First thing first, we grab the mesh and mesh's userdata that contains our wallNumber that corresponds with the wall number of the current wall.
    let mesh = intersectedWall.object
    let wallNumber = typeof mesh.userData.wallNumber != "number"? mesh.userData.wallNumber.toInt() :  mesh.userData.wallNumber
    let wallCurrent = {}; // Initalizes an empty object that would contain the associated.

    cabinet.roomID = room.roomID    //associates the cabinetRoomID with the current room.
    
    // This loops checks if one of each walls's wallNumber is equal to the interesctedWall's wallnumber, if the current is the wall we are checking, we replace
    // the wallCurrent with the current wall and break it out of the loop
    for (let wall of room.state.wallList)
    {
        if (wall.wallNumber == wallNumber)
        {
            wallCurrent = wall;
            break;
        }
    }

    // the cabinet's wall properties equals to the wallCurrent we cross-checked and determined a while ago.
    cabinet.wall = wallCurrent;
    
    // The cabinet's posx and posy are determine by the raycaster's intersection x and y point

    cabinet.posx = intersectedWall.point.x
    cabinet.posz = intersectedWall.point.z

    //Since we are attaching to the wall, the cabinet's posy is 0
    //TODO: wallheight needs to be gotten from the room.state.wallist[index of wall found from wall userdata]
    if(cabinet.isUpper === true){
        cabinet.posy = cabinet.wall.wallHeight*CONVERSION
    }
    else {
        cabinet.posy = cabinet.posy
    }
    

    // By using pythagoream theorem, we determine the distance from the wall accurately to place our cabinet correctly.
    cabinet.distanceAlongWall = Math.sqrt((cabinet.posx - cabinet.wall.posX* CONVERSION) ** 2 + (cabinet.posz - cabinet.wall.posZ* CONVERSION) ** 2)


    
    // BELOW IS WHERE WE ADDED A FUNCTIONALITY TO PROPERLY SNAP THE WALL SO IT DOES NOT CLIP THROUGH THE WALLS
    KeepCabinetInsideWall(cabinet);
    
    // IF THE CABINET IN THE WALL BEGANS TO CLIP THROUGH IN THE LEFT SIDE OF THE WALL, THIS PORTION FIRES!


    // The cabinet rotz propeties has been updated by the wall's wall rotation properties.
    cabinet.rotz = cabinet.wall.wallRotation;

    // Then we return that cabinet object
    return { ...cabinet };
}




