import * as CabinetDB from "../../Utilities/CabinetDB";
import { describe, beforeEach, expect, it } from '@jest/globals'
import TestRenderer from 'react-test-renderer'
import AttributeMenu from '../../Components/Core/AttributeMenu';
import { screen, render, fireEvent, createEvent, waitFor } from '@testing-library/react';
import { cloneDeep } from "lodash";
import React from 'react';
import * as Cabinet from "../../Components/Shared/Models/Cabinet";
import { propNames } from "@chakra-ui/styled-system";
import { CONVERSION } from "../../Components/Core/CatalogItem";




/////////////////////////Mocks////////////////////////
jest.mock('../../../node_modules/three/src/loaders/TextureLoader', () => ({
    TextureLoader: 0
}));
jest.mock('three/examples/jsm/loaders/OBJLoader', () => ({
    OBJLoader: 0
}))

jest.mock('@react-three/fiber', () => ({
    ...jest.requireActual('@react-three/fiber'),
    Canvas: ({ }) => (<div><p>'hello'</p></div>),
}))



jest.mock('@react-three/drei', () =>({
    ...jest.requireActual('@react-three/fiber'),
    TransformControls: (props) => (<div id='transform'  data-testid='transform'>{props.children}</div>)
    
}))
jest.mock('three', () =>({
    ...jest.requireActual('three'),
    group : (props) => (<div>{props.children}</div>)    
}))

jest.spyOn(CabinetDB, 'updateCabinet').mockResolvedValue({ cab: "this is a cabinet i promise" });
let EntityList;
let attributeMenuTester;
let mockedCameraRef = {current: {enabled:true}}
let wall= {
    wallNumber: 1,
    posX: 10,
    posZ: 5,
    wallLength: 10,
    wallHeight: 5,
    wallRotation: Math.PI/2,
    leftWall: null,
    node: {}
    }



beforeEach(async () => {
    EntityList = [
        {
            "cabRef": { "current": { "children": [{}, { "position": { "x": 10, "y": 0, "z": 30 } }] } },
            "isMovable": false, "posx": 10, "posy": 0, "posz": 30,
            "wall": { "leftWall": null, "node": {}, "posX": 10, "posZ": 5, "wallHeight": 5, "wallLength": 10, "wallNumber": 1, "wallRotation": 1.5707963267948966 },
            "isCollided": false, "hasSnapped": false,
            "distanceAlongWall": 26.553133302870304,
        },
        {
            "cabRef": { "current": { "children": [{}, { "position": { "x": 15, "y": 0, "z": 30 } }] } },
            "isMovable": false, "posx": 15, "posy": 0, "posz": 30,
            "wall": { "leftWall": null, "node": {}, "posX": 10, "posZ": 5, "wallHeight": 5, "wallLength": 10, "wallNumber": 1, "wallRotation": 1.5707963267948966 },
            "isCollided":false
        }
    ];

    attributeMenuTester = TestRenderer.create(<AttributeMenu currentSelection={{}} room={{ setState: jest.fn() }} />)
    attributeMenuTester.getInstance().setState = jest.fn()
    attributeMenuTester.getInstance().deleteHandler = jest.fn()
})



///////////////////////////////////General AttributeMenu tests/////////////////
describe("When Attribute Menu pops up", () => {
    it("A move button appears in the attribute menu when it pops up ", () => {

        let cabData = { posx: 1, posy: 2, posz: 3, isMovable: false }
        render(<AttributeMenu currentSelection={cabData} room={{ setState: jest.fn() }}/>);
        const moveButton = screen.getAllByTestId('move-button')[0]    
        expect(moveButton).toBeDefined()
        expect(moveButton).toBeInTheDocument()
        
    });
    it("Should remove the Transform controls when the Delete button is pressed", () => {
        let cabData = { posx: 1, posy: 2, posz: 3, isMovable: true, wall:wall}
        render(
            <Cabinet.ObjectMovable  isMovable={cabData.isMovable} position={[cabData.posx,cabData.posy,cabData.posz]} rotation={[0,0,0]} positionAdjuster={[0,0,0]} >
            <p> Look at me, I'm a cabinet! </p>
        </Cabinet.ObjectMovable>
        );
        let controls = screen.queryAllByTestId('transform');
        expect(controls.length).toEqual(1);
      
       
        attributeMenuTester.getInstance().deleteHandler(cabData, EntityList)
        render();

         controls = screen.queryByTestId('transform');
        expect(controls.length).not.toEqual(1);

    });


})



//////////////////////////Move button tests - goes in attibuteMenu.js////////////////////////////////////
describe("When Move button is Pressed", () => {

    it("Should cause the Transform controls to appear with the correct settings/parameters", async () => {
        let cabData = { posx: 1, posy: 2, posz: 3, isMovable: false, wall:wall}
        let selectedCab = cabData
        render(
            <Cabinet.ObjectMovable  isMovable={cabData.isMovable} position={[cabData.posx,cabData.posy,cabData.posz]} rotation={[0,0,0]} positionAdjuster={[0,0,0]} >
            <p> Look at me, I'm a cabinet! </p>
        </Cabinet.ObjectMovable>
        );
        let controls = screen.queryAllByTestId('transform');
        expect(controls.length).toEqual(0);
  
        await attributeMenuTester.getInstance().moveButtonHandler(selectedCab, EntityList, mockedCameraRef)
        render(
            <Cabinet.ObjectMovable  isMovable={cabData.isMovable} position={[cabData.posx,cabData.posy,cabData.posz]} rotation={[0,0,0]} positionAdjuster={[0,0,0]} >
            <p> Look at me, I'm a cabinet! </p>
        </Cabinet.ObjectMovable>
        );
        screen.debug()
        controls =  screen.queryAllByTestId('transform');
        expect(controls.length).toEqual(1);

    });

    it("A done button appears in place of move button", async () => {

        let cabData = { posx: 1, posy: 2, posz: 3, isMovable: false, wall:wall}
        render(<AttributeMenu currentSelection={cabData} room={{ setState: jest.fn(), cameraControlRef:mockedCameraRef }}/>);

        const moveButton = screen.getAllByTestId('move-button')[0]
        await fireEvent.click(moveButton)
        render(<AttributeMenu currentSelection={cabData} room={{ setState: jest.fn(), cameraControlRef:mockedCameraRef }}/>);

        const doneButton = screen.getAllByTestId('submit-button')[0]
        expect(doneButton).toBeDefined()
        expect(doneButton).toBeInTheDocument()

    });
    it("A reset buttons appear in place of move button", async () => {

        let cabData = { posx: 1, posy: 2, posz: 3, isMovable: false, wall:wall}
        render(<AttributeMenu currentSelection={cabData} room={{ setState: jest.fn(), cameraControlRef:mockedCameraRef }}/>);

        const moveButton = screen.getAllByTestId('move-button')[0]
        fireEvent.click(moveButton)
        render(<AttributeMenu currentSelection={cabData} room={{ setState: jest.fn(), cameraControlRef:mockedCameraRef }}/>);
        const resetButton = screen.getAllByTestId('reset-button')[0]
        expect(resetButton).toBeDefined()
        expect(resetButton).toBeInTheDocument()

    });

});


//////////////////////////Done Move button tests(moveSubmitHandler) - goes in attributeMenu/////////////////////////////////////////
describe("When the Done Moving button is pressed", () => {

    it("Should update the Entity list with the correct information so that the position changes persist.", async() => {

        let cabData =
        {
            "cabRef": { "current": { "children": [{}, { "position": { "x": 10, "y": 0, "z": 30 } }] } },
            "isMovable": true, "posx": 10, "posy": 0, "posz": 30, "collideChecked": false,
            "wall": { "leftWall": null, "node": {}, "posX": 10, "posZ": 5, "wallHeight": 5, "wallLength": 10, "wallNumber": 1, "wallRotation": 1.5707963267948966 },
            "isCollided": false,
        };
        cabData = await attributeMenuTester.getInstance().moveSubmitHandler(cabData, { state : { entityList : EntityList }}, mockedCameraRef);
        expect(cabData).toEqual(EntityList[0]);
    });

    it("should call the method that will update the database", async () => {
        let cabData = { posx: 1, posy: 2, posz: 3 , isMovable: true, 
            cabRef:{
                current: {
                    children:[{},{position:{x:10, y:20, z:30}}]
                }
            }, wall:wall}
        
        attributeMenuTester.getInstance().moveSubmitHandler(cabData, { state : { entityList : EntityList }},mockedCameraRef);
        expect(await CabinetDB.updateCabinet).toHaveBeenCalled();
    });



    it("posy of the cabinet should not change have changed", () => {

        let cabData = { posx: 1, posy: 2, posz: 3 , isMovable: true, 
            cabRef:{
                current: {
                    children:[{},{position:{x:10, y:20, z:30}}]
                }
            },
            wall: {
                wallNumber: 1,
                posX: 10,
                posZ: 5,
                wallLength: 10,
                wallHeight: 5,
                wallRotation: Math.PI/2,
                leftWall: null,
                node: {}
            },
        }
        
        let originalPosY = cabData.posy
        attributeMenuTester.getInstance().moveButtonHandler(cabData, { state : { entityList : EntityList }},mockedCameraRef);

        //Moving the cabinet - basically changing the posx, poxy and posz
        cabData.cabRef.current.children[1].position.y = 200

      
        attributeMenuTester.getInstance().moveSubmitHandler(cabData, { state : { entityList : EntityList }},mockedCameraRef);

        expect(cabData.posy).toBe(originalPosY)

    })

    
    it("posx of the cabinet should not be more than the posx of wall", () => {
        let cabData = { posx: 1, posy: 2, posz: 3 , isMovable: true, 
            cabRef:{
                current: {
                    children:[{},{position:{x:10, y:20, z:30}}]
                }
            },
            wall: {
                wallNumber: 1,
                posX: 10,
                posZ: 5,
                wallLength: 20,
                wallHeight: 5,
                wallRotation: Math.PI/2,
                leftWall: null,
                node: {}
            },
            distanceAlongWall: 1.0
        }
        
        attributeMenuTester.getInstance().moveButtonHandler(cabData, EntityList,mockedCameraRef);

        //Moving the cabinet - basically changing the posx, poxy and posz
        cabData.cabRef.current.children[1].position.x = cabData.wall.posX  + 75

        attributeMenuTester.getInstance().moveSubmitHandler(cabData, { state : { entityList : EntityList }},mockedCameraRef);

        expect(cabData.posx).toBeLessThan(cabData.wall.posX *CONVERSION + cabData.wall.wallLength *CONVERSION )
        expect(cabData.posx).toBeGreaterThan(-cabData.wall.posX)

    })



});


//////////////////////////Reset Move button tests(moveResetHandler) - goes in attributeMenu/////////////////////////////////////////
describe("When the Reset button is clicked", () => {
    it("Should reset the cabinets position to its original position", async() => {

        //initial cabData the cabinet
        let cabData = EntityList[0]
        let initialCabData =  EntityList[0]

        attributeMenuTester.getInstance().moveButtonHandler(cabData, EntityList,mockedCameraRef);

        //Moving the cabinet - basically changing the posx, poxy and posz
        cabData.cabRef.current.children[1].position.x = 11
        cabData.cabRef.current.children[1].position.z = 16

        attributeMenuTester.getInstance().moveButtonHandler(cabData, EntityList,mockedCameraRef);

        //Clicking on the reset button - basically calling the moveResetHandler and passing in the updated cabdata with cabid
        await attributeMenuTester.getInstance().moveResetHandler(cabData, EntityList,mockedCameraRef);

        //the entity menu should contain the initail cabinet
        expect(cabData.posx).toEqual(initialCabData.posx);
        expect(cabData.posz).toEqual(initialCabData.posz);

        //should not contain the changed cabdata
 
    });

    it("Should not update the entity list", () => {

       //initial cabData the cabinet
       let cabData = EntityList[0]
        let initialCabData =  EntityList[0]

       attributeMenuTester.getInstance().moveButtonHandler(cabData, EntityList,mockedCameraRef);
       //Moving the cabinet - basically changing the posx, poxy and posz
       cabData.cabRef.current.children[1].position.x = 11
       cabData.cabRef.current.children[1].position.z = 16

       //Clicking on the reset button - basically calling the moveResetHandler and passing in the updated cabdata with cabid
        attributeMenuTester.getInstance().moveResetHandler(cabData, EntityList, mockedCameraRef);

       //the entity list should remain same
        expect(cabData).toEqual(initialCabData);

    });

    it("Should remove the Transform Controls", () => {
        let cabData = { cabinetID: 1, posx: 1, posy: 2, posz: 3, isMovable: true , wall:wall}
       
        render(
            <Cabinet.ObjectMovable  isMovable={cabData.isMovable} position={[cabData.posx,cabData.posy,cabData.posz]} rotation={[0,0,0]} positionAdjuster={[0,0,0]} >
            <p> Look at me, I'm a cabinet! </p>
        </Cabinet.ObjectMovable>
        );
        screen.debug()
        let controls =  screen.queryAllByTestId('transform');
        expect(controls.length).toEqual(1);


        //Clicking on the reset button - basically calling the moveResetHandler
        attributeMenuTester.getInstance().moveResetHandler(cabData, EntityList,mockedCameraRef);

        render(
            <Cabinet.ObjectMovable  isMovable={cabData.isMovable} position={[cabData.posx,cabData.posy,cabData.posz]} rotation={[0,0,0]} positionAdjuster={[0,0,0]} >
            <p> Look at me, I'm a cabinet! </p>
        </Cabinet.ObjectMovable>
        );
         //Expect transform controls TO BE NOT ON THE SCREEN when the reset button is pressed
        controls = screen.queryByTestId('transform');
        expect(controls.length).not.toEqual(1);

    });
});

describe("Collision tests when cabinet is moved", () => {

    it("fire their Collision when Cabinets moved on top of other cabinets and when moved off collided cabinets are no longer marked as collided", async () => {
        
        //initial cabData 
        let cabinet1 = cloneDeep(EntityList[0])
        let cabinet2 =  cloneDeep(EntityList[1])

        attributeMenuTester.getInstance().moveButtonHandler(cabinet1, EntityList,mockedCameraRef);

        //Colling the cabinets
        cabinet1.posx = cabinet2.posx
        cabinet1.posz = cabinet2.posz

        //press submit
        attributeMenuTester.getInstance().moveSubmitHandler(cabinet1,  { state : { entityList : EntityList }}, mockedCameraRef);
                
        attributeMenuTester.getInstance().moveButtonHandler(cabinet1, EntityList,mockedCameraRef);

        //not colliding the cabinets
        cabinet1.posx = EntityList[0].posx
        cabinet1.posz = EntityList[0].posz

        //press submit
        attributeMenuTester.getInstance().moveSubmitHandler(cabinet1,  { state : { entityList : EntityList }}, mockedCameraRef);

        expect(cabinet1.isCollided).toBe(false)
        expect(cabinet2.isCollided).toBe(false)

    })
    
    it("should not fire collision when Moving one cabinet, and then moving a different cabinet into the first’s location ", async () => {
          
        //initial cabData 
        let cabinet1 = cloneDeep(EntityList[0])
        let cabinet2 =  cloneDeep(EntityList[1])

        attributeMenuTester.getInstance().moveButtonHandler(cabinet1, EntityList,mockedCameraRef);

        //Colling the cabinets
        cabinet1.posx = cabinet1.posx + 30 
        

        //press submit
        attributeMenuTester.getInstance().moveSubmitHandler(cabinet1,  { state : { entityList : EntityList }}, mockedCameraRef);

        
        attributeMenuTester.getInstance().moveButtonHandler(cabinet2, EntityList,mockedCameraRef);

        //Colling the cabinets
        cabinet2.posx = cabinet1.posx 
        

        //press submit
        attributeMenuTester.getInstance().moveSubmitHandler(cabinet2, { state : { entityList : EntityList }}, mockedCameraRef);
        
        expect(cabinet1.isCollided).toBe(false)
        expect(cabinet2.isCollided).toBe(false)

    })

})

