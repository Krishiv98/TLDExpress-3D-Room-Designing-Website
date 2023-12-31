import { addRoomAndWallsToDB } from '../../Utilities/RoomDB';

//TODO Might be used for rendering the Wall itself... Look into Room.js's WallRef
const tempWallHeight = 3
/**
 * this method will create a rectangular room with 4 walls, using the dimensions handed in. It will then call AddRoomAndWallsToDB to push the created information into the Database.
 * @param {double} length 
 * @param {double} width 
 * @returns 
 */

// GABE: Expect ROOM ID to be removed as one of the property.
export async function makeAllWalls(length, width){ // Remove Room ID from here when removing the prompt for room ID and implementing the Hashed IDs. This will require much Test Refactoring, as well as break demo ability.
    // make 4 walls
    let wallArray = []
    let XPositions = [0,length,length,0]
    let ZPositions = [0,0,width,width]
    let rotations = [0, 3 * Math.PI /2, Math.PI, Math.PI / 2] // Note - There is the possibility that this makes all 4 walls face the wrong directions. Either turn some of the X/Z 
                                                              // positions negative, or reverse the rotations. Idk make it look good.
    let LastWall = null;
    for (let i = 0; i < 4; i++){
        let wallLength = (i%2==0?length:width)
        wallArray.push(createStraightWall(i+1,XPositions[i],ZPositions[i],wallLength,tempWallHeight,rotations[i],LastWall))
        LastWall = wallArray[i] // Put a reference to the current wall as the last wall in the database, so that the walls refer to each other correctly in order.
    }
    // Make the Room, add room and walls to Database

    // The addRoomAndWallsToDB will be refactor to accept only the wall array. The creation of the room instance and its
    // will be on that function!
    // PREPARE TO REMOVE SomeROOM
    let roomID = await addRoomAndWallsToDB(wallArray)
    return {WallArray: wallArray,roomID : roomID };
}

export async function makeAllCustomWalls(lineArray, lengthScale){
    let wallArray = []

    //Subtracting the X and Y coordinates of a wall from previous wall to convert the X and Y 
    //coordinates from canvas for creating walls
    let startX = lineArray[0].fromX
    let startY = lineArray[0].fromY

    for(let i = 0; i < lineArray.length; i++){
        let curLine = lineArray[i]
        
        //calculate the length of the line from pixels to metres
        let curLineLength
        curLineLength = Math.pow((Math.abs(curLine.fromX - curLine.toX)),2) +
                        Math.pow((Math.abs(curLine.fromY - curLine.toY)),2);
        curLineLength = Math.sqrt(curLineLength)/lengthScale

        let curYLine, curXLine, curLineRotation, originRotation

        curXLine = curLine.toX - curLine.fromX
        curYLine = curLine.toY - curLine.fromY

        //chech if the line is going vertical
        if(curXLine === 0){
            if(curYLine < 0){
                // if line is going up 90 deg
                curLineRotation = Math.PI/2
            }
            else{
                //ifline go down 270 deg
                curLineRotation = (3*Math.PI)/2
            }
        }
        else{
            //NOTE: following calculations use a standard grid 
            //HOWEVER: for consistance the positive or negative y values are switched 
            originRotation = Math.atan(Math.abs(curYLine/curXLine))

            // if y is 0 , deg is either 0 or 180
            if(curXLine < 0 && curYLine <= 0){ // x y neg

                curLineRotation = Math.PI - originRotation
            }
            else if(curXLine < 0 && curYLine > 0){ // x neg  y poss

                curLineRotation = originRotation + Math.PI
            } else if(curXLine > 0 && curYLine > 0 ){ // x y pos

                curLineRotation = (Math.PI * 2) - originRotation
            }
            else{ // x pos y neg 

                curLineRotation = originRotation
            }
        }

        // curLineLength = curLineLength +0.3

        wallArray.push(createStraightWall(i+1, (curLine.fromX - startX)/lengthScale, (curLine.fromY - startY)/lengthScale, curLineLength, tempWallHeight, curLineRotation, i > 0 ? wallArray[i-1] : null))
    }
  
    let returnID = await addRoomAndWallsToDB(wallArray)


    // Render room // THIS WILL NOW BE HANDLED IN ROOM.JS
    return {WallArray: wallArray,roomID : returnID};

}

//TODO if no extra features / logic will remove method. May put Validation here as a location for it.
export function createStraightWall(number, posX, posZ, length, height, rotation, leftWall = null ){

    let returnWall = {
        wallNumber: number,
        posX: posX,
        posZ: posZ,
        wallLength: length,
        wallHeight: height,
        wallRotation: rotation,
        leftWall: leftWall
    }

    return returnWall;
}
