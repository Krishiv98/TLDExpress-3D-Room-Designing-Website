import React, { useEffect, useRef } from 'react';
import Neode from 'neode';
import { screen, render, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import '@testing-library/jest-dom'
import RoomLayoutUI from '../../Components/Core/RoomLayoutUI';
import {makeAllCustomWalls} from '../../Components/Core/Wall';
import { TwoDimensionalDraw, startDrawing } from '../../Components/Features/TwoDimentionalDraw';
import { describe, beforeAll, beforeEach, afterAll, afterEach, expect, test, it } from '@jest/globals'
import addWallToDB from '../../Utilities/RoomDB'
import ReactThreeTestRenderer from '@react-three/test-renderer'
import { create } from 'combined-stream';
import { resolved5WallsLookup } from '../mocks'
import * as RoomDB from '../../Utilities/RoomDB';
import * as Wall from '../../Components/Core/Wall';

/////////////////////////Mocks////////////////////////
jest.mock('../../../node_modules/three/src/loaders/TextureLoader', () => ({
  TextureLoader: 0
}));
jest.mock('three/examples/jsm/loaders/OBJLoader', () => ({
  OBJLoader: 0
}))

jest.mock('@react-three/fiber', () => ({
  ...jest.requireActual('@react-three/fiber'),
  Canvas: ({ }) => (<p>'hello'</p>)// TODO Maybe remove for performance
}))

jest.mock('../../Components/Core/CatalogUI.js')
jest.mock('../../Components/Core/AttributeMenu.js', () => () => {
  return <div data-testid="attribute-menu">asdf</div>
});


jest.setTimeout(5000)
window.prompt = jest.fn(()=> 1)
jest.mock('Neode')


//////////////////////////Global Variables for testing///////////////////////
//Length scale used in program
let lengthScale = 1
//length of the horizontal line
let horizontalLineLenght = 10
//Length of the angled line
let angleWallLength = 5
//Angle between the previous line to the new line
let angBetweenWalls = 150
let angBetweenWallsRad = 150 * Math.PI / 180
//Math to calculate the correct coordinates for the angles line
//calculate the Y coordinate offset for the angled line
let calcposy = (Math.abs(angBetweenWalls - 180))
calcposy = calcposy * Math.PI / 180
calcposy = Math.cos(calcposy) * angleWallLength * lengthScale
//calculate the X coordinate offset for the angled line
let calcposx = (Math.abs(angBetweenWalls - 180))
calcposx = calcposx * Math.PI / 180
calcposx = Math.tan(calcposx) * calcposy




//The coordinates that will be used to draw the lines from the origin of where the line needs to be added
//Line 559 needs length scale 50
let originXY = { posx: 20, posy: 20 }
let drawPoints = [
  {
    posx: originXY.posx,
    posy: originXY.posy,
  },
  {
    //adding 10 as that will be the length of the wall that will be created
    posx: originXY.posx + (horizontalLineLenght * lengthScale),
    posy: originXY.posy,
  }
]
//adding the test coordinates
drawPoints.push({
  posx: Math.round(drawPoints[1].posx + calcposx),
  posy: Math.round(drawPoints[1].posy + calcposy),

})


/**
 * Use this method to 
 * @param lengthScale 
 */

function recalculateDrawPoints(lengthScale) {

  lengthScale = lengthScale
  //length of the horizontal line
  horizontalLineLenght = 10
  //Length of the angled line
  angleWallLength = 5
  //Angle between the previous line to the new line
  angBetweenWalls = 150
  angBetweenWallsRad = 150 * Math.PI / 180
  //Math to calculate the correct coordinates for the angles line
  //calculate the Y coordinate offset for the angled line
  calcposy = (Math.abs(angBetweenWalls - 180))
  calcposy = calcposy * Math.PI / 180
  calcposy = Math.cos(calcposy) * angleWallLength * lengthScale
  //calculate the X coordinate offset for the angled line
  calcposx = (Math.abs(angBetweenWalls - 180))
  calcposx = calcposx * Math.PI / 180
  calcposx = Math.tan(calcposx) * calcposy
  //The coordinates that will be used to draw the lines from the origin of where the line needs to be added
  //Line 559 needs length scale 50
  originXY = { posx: 20, posy: 20 }
  drawPoints = []
  drawPoints = [
    {
      posx: originXY.posx,
      posy: originXY.posy,
    },
    {
      //adding 10 as that will be the length of the wall that will be created
      posx: originXY.posx + (horizontalLineLenght * lengthScale),
      posy: originXY.posy,
    }
  ]
  //adding the test coordinates
  drawPoints.push({
    posx: Math.round(drawPoints[1].posx + calcposx),
    posy: Math.round(drawPoints[1].posy + calcposy),

  })

}



let container
// const user = null

describe("TwoDimentionalDraw.js", () => {

  jest.mock('Neode')
  // user = userEvent.setup()

  beforeEach(() => {
    // container = document.createElement("div")
    // document.body.appendChild(container)

    //setting up suer interaction


    act(() => {
      // ReactDOM.createRoot(container).render(<RoomLayoutUI />)
      container = render(<RoomLayoutUI />)

    })

  });

  afterEach(() => {
    // document.body.removeChild(container);
    container = null;
    jest.clearAllMocks()
    jest.restoreAllMocks();
  });


  //////////////Ignore this//////////////////////////////////
  let theFirstWall = {
    wallNumber: 1,
    posx: drawPoints[0].posx,
    posZ: drawPoints[0].posy,
    wallLength: 10,
    wallHeight: 5,
    wallRotation: 0,
    leftWall: null
  }

  let theSecondWall = {
    wallNumber: 2,
    posx: drawPoints[1].posx,
    posZ: drawPoints[1].posx,
    wallLength: 5,
    wallHeight: 5,
    wallRotation: 180 - angBetweenWalls,
    leftWall: theFirstWall
  }

  it('renders the two dimensional draw', async () => {
    //Open the Drawer
    const CustomLayoutButton = screen.getAllByText('CUSTOM LAYOUT')[0]
    await fireEvent.click(CustomLayoutButton)

    //Get the drawing Canvas from the Drawer
    const canvas = screen.getByTestId('TwoDimensionalCanvas')
    expect(canvas).not.toBeNull()
    expect(canvas).toBeInTheDocument();

  })

  it('renders 4 buttons (Start drawing, clear, cancel and submit)', async () => {
    //Open the Drawer
    const CustomLayoutButton = screen.getAllByText('CUSTOM LAYOUT')[0]
    fireEvent.click(CustomLayoutButton)

    //Skips the caution portion
    const ContinueButton =  screen.getByRole('button', {name: /continue/i})
    fireEvent.click(ContinueButton);

    //Get the drawing Canvas from the Drawer


    const buttons = await screen.findAllByRole('button')
    expect(buttons).not.toBeNull()
    expect(buttons.length).toEqual(4)

  })
  it('that the cancel button dismisses current drawer and opens Select Layout Modal', async() => {
    const CustomLayoutButton = screen.getAllByText('CUSTOM LAYOUT')[0]
    fireEvent.click(CustomLayoutButton)

    //Skips the caution portion
    const ContinueButton =  screen.getByRole('button', {name: /continue/i})
    fireEvent.click(ContinueButton);

    let canvas = null
    //Get the drawing Canvas from the Drawer
    await waitFor(() =>
      canvas = screen.getByTestId('TwoDimensionalCanvas')
    )

    expect(canvas).not.toBeNull()

    const canvasParent = screen.getByTestId('CanvasParent')
    expect(canvasParent).not.toBeNull()

    const cancelButton = screen.getAllByText('Cancel')[0]
    expect(cancelButton).not.toBeNull()
    await waitFor(() =>
     fireEvent.click(cancelButton)
    )
   
    canvas =  screen.queryAllByTestId('TwoDimensionalCanvas')
    // expect((await screen.findAllByRole('canvas')).length).toBe(0)
    expect(canvas).toHaveLength(0)

    const ChooseLayoutModal = screen.getByTestId('ChooseLayoutModal')
    expect(ChooseLayoutModal).not.toBeNull()
    expect(ChooseLayoutModal).toBeInTheDocument()
  })

  describe("startDrawingButtonHandler", () => {
    it("should render a line in the canvas when user clicks on the screen two times", async () => {

      ////////////////////////Arrange - Initial Setup/////////////
      //Open the Drawer
      const CustomLayoutButton = screen.getAllByText('CUSTOM LAYOUT')[0]
      await fireEvent.click(CustomLayoutButton)

      //Skips the caution portion
      const ContinueButton =  screen.getByRole('button', {name: /continue/i})
      await fireEvent.click(ContinueButton);


      let canvas = null
      //Get the drawing Canvas from the Drawer
      await waitFor(() =>
        canvas = screen.getByTestId('TwoDimensionalCanvas')
      )

      expect(canvas).not.toBeNull()

      const canvasParent = screen.getByTestId('CanvasParent')
      expect(canvasParent).not.toBeNull()

      const StartDrawingButton = screen.getAllByText('Start Drawing')[0]
      await fireEvent.click(StartDrawingButton)
      const ctx = canvas.getContext('2d');
      expect(canvas).not.toBeNull()

      /////////////////////Act -Fire Mouse Events///////////////////////

      //Fire the mouse events to click on two different places 
      let firstclickevent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
        screenX: drawPoints[0].posx,
        screenY: drawPoints[0].posy,
        button: 0,
      })

      let secondclickevent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
        screenX: drawPoints[1].posx,
        screenY: drawPoints[1].posy,
        button: 0,
      })


      await waitFor(() =>
        fireEvent(canvas, firstclickevent)
      )
      await waitFor(() =>
        fireEvent(canvas, secondclickevent)
      )

      //////////////////////////Assertions////////////////////////////
      //Check if the two cooordinates exist on a path on the canvas
      expect(ctx.isPointInPath(drawPoints[0].posx, drawPoints[0].posy)).toBe(true);
      expect(ctx.isPointInPath(drawPoints[1].posx, drawPoints[1].posy)).toBe(true);

    })

    it("should display a second line from the end of the previous line " +
      "to where the mouse is clicked again", async () => {
        /////////////////Arrange - initial set up/////////////////////////////////

        //Open the Drawer
        const CustomLayoutButton = screen.getAllByText('CUSTOM LAYOUT')[0]
        fireEvent.click(CustomLayoutButton)

        //Skips the caution portion
        const ContinueButton =  screen.getByRole('button', {name: /continue/i})
        fireEvent.click(ContinueButton);

        let canvas = null
        //Get the drawing Canvas from the Drawer
        await waitFor(() =>
          canvas = screen.getByTestId('TwoDimensionalCanvas')
        )

        expect(canvas).not.toBeNull()
        canvas.width = 1000
        canvas.height = 1000


        const canvasParent = screen.getByTestId('CanvasParent')
        expect(canvasParent).not.toBeNull()

        const StartDrawingButton = screen.getAllByText('Start Drawing')[0]
        await fireEvent.click(StartDrawingButton)
        const ctx = canvas.getContext('2d');
        expect(canvas).not.toBeNull()

        /////////////////////Act -Fire Mouse Events///////////////////////


        //Fire the mouse events to click on two different places 
        let firstclickevent = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true,
          screenX: drawPoints[0].posx,
          screenY: drawPoints[0].posy,
          button: 0,
        })
        let move1 = new MouseEvent('mousemove', {
          view: window,
          bubbles: true,
          cancelable: true,
          screenX: drawPoints[1].posx,
          screenY: drawPoints[1].posy,
          button: 0,
        })

        let secondclickevent = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true,
          screenX: drawPoints[1].posx,
          screenY: drawPoints[1].posy,
          button: 0,
        })
        let move2 = new MouseEvent('mouseover', {
          view: window,
          bubbles: true,
          cancelable: true,
          screenX: drawPoints[2].posx,
          screenY: drawPoints[2].posy,
          button: 0,
        })
        let thirdclickevent = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true,
          screenX: drawPoints[2].posx,
          screenY: drawPoints[2].posy,
          button: 0,
        })


        await waitFor(() =>
          fireEvent(canvas, new MouseEvent('mouseenter'))
        )
        await waitFor(() =>
          fireEvent(canvas, firstclickevent)
        )
        await waitFor(() =>
          fireEvent(canvas, move1)
        )
        await waitFor(() =>
          fireEvent(canvas, secondclickevent)
        )
        await waitFor(() =>
          fireEvent.mouseMove(canvas, { screenY: drawPoints[2].posx, screenY: drawPoints[2].posy })

        )
        await waitFor(() =>
          fireEvent(canvas, thirdclickevent)
        )
        await waitFor(() =>
          fireEvent.mouseMove(canvas, { screenY: drawPoints[0].posx, screenY: drawPoints[0].posy })

        )


        //////////////////////////Assertions////////////////////////////
        //Check if the two cooordinates exist on a path on the canvas

        expect(ctx.isPointInPath(drawPoints[0].posx, drawPoints[0].posy)).toBe(true);
       
        expect(ctx.isPointInPath(drawPoints[1].posx, drawPoints[1].posy)).toBe(true);
       
        expect(ctx.isPointInPath(drawPoints[2].posx, drawPoints[2].posy)).toBe(true);
      })

    it("should not display angle for the first line drawn", async () => {
      /////////////////Arrange - initial set up/////////////////////////////////////////
      const CustomLayoutButton = screen.getAllByText('CUSTOM LAYOUT')[0]
      await fireEvent.click(CustomLayoutButton)

      //Skips the caution portion
      const ContinueButton =  screen.getByRole('button', {name: /continue/i})
      await fireEvent.click(ContinueButton);


      const canvas = screen.getByTestId('TwoDimensionalCanvas')
      expect(canvas).not.toBeNull()

      const ctx = canvas.getContext('2d');
      ctx.canvas.width = 1000
      ctx.canvas.height = 1000

      const StartDrawingButton = screen.getAllByText('Start Drawing')[0]
      await fireEvent.click(StartDrawingButton)

      /////////////////////////Act/////////////////////////
      let firstclickevent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
        screenX: drawPoints[0].posx,
        screenY: drawPoints[0].posy,
        button: 0,
      })

      let secondclickevent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
        screenX: drawPoints[1].posx,
        screenY: drawPoints[1].posy,
        button: 0,
      })
      await waitFor(() =>
        fireEvent(canvas, firstclickevent)
      )
      await waitFor(() =>
        fireEvent(canvas, secondclickevent)
      )

      ////////////////////////Assertion//////////////////////////
      const angleText = screen.getAllByTestId('Angle')[0]
      expect(angleText.innerHTML).toEqual('N/A')
    })

    it("should display angle for the second line drawn", async () => {
      /////////////////////////////Arrange - initial setup/////////////////////

      const CustomLayoutButton = screen.getAllByText('CUSTOM LAYOUT')[0]
      fireEvent.click(CustomLayoutButton)

      //Skips the caution portion
      const ContinueButton =  screen.getByRole('button', {name: /continue/i})
      fireEvent.click(ContinueButton);


      let canvas = null
      //Get the drawing Canvas from the Drawer
      await waitFor(() =>
        canvas = screen.getByTestId('TwoDimensionalCanvas')
      )

      expect(canvas).not.toBeNull()

      const canvasParent = screen.getByTestId('CanvasParent')
      expect(canvasParent).not.toBeNull()

      const StartDrawingButton = screen.getAllByText('Start Drawing')[0]
      fireEvent.click(StartDrawingButton)
      const ctx = canvas.getContext('2d');
      ctx.canvas.width = 1000
      ctx.canvas.height = 1000
      expect(canvas).not.toBeNull()

      /////////////////////Act -Fire Mouse Events///////////////////////


      //Fire the mouse events to click on two different places 
      let firstclickevent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
        screenX: drawPoints[0].posx,
        screenY: drawPoints[0].posy,
        button: 0,
      })
      let moveEvent = new MouseEvent('mousemove', {
        view: window,
        bubbles: true,
        cancelable: true,
        screenX: drawPoints[1].posx,
        screenY: drawPoints[1].posy,
        button: 0,
      })

      let secondclickevent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
        screenX: drawPoints[1].posx,
        screenY: drawPoints[1].posy,
        button: 0,
      })
      let moveEvent2 = new MouseEvent('mousemove', {
        view: window,
        bubbles: true,
        cancelable: true,
        screenX: drawPoints[2].posx,
        screenY: drawPoints[2].posy,
        button: 0,
      })
      let thirdclickevent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
        screenX: drawPoints[2].posx,
        screenY: drawPoints[2].posy,
        button: 0,
      })


      await waitFor(() =>
        fireEvent(canvas, firstclickevent)
      )
      await waitFor(() =>
        fireEvent(canvas, moveEvent)
      )
      await waitFor(() =>
        fireEvent(canvas, secondclickevent)
      )
      await waitFor(() =>
        fireEvent(canvas, moveEvent2)
      )
      await waitFor(() =>
        fireEvent(canvas, thirdclickevent)
      )

      const angleText = screen.getAllByTestId('Angle')[0]
      expect(angleText.innerHTML).toEqual('126.9')

    })

    it("should display the length of the line being drawn", async () => {
      recalculateDrawPoints(50)

      ///////////////////////////////////Arrange/////////////////////////
      //Open the Drawer
      const CustomLayoutButton = screen.getAllByText('CUSTOM LAYOUT')[0]
      await fireEvent.click(CustomLayoutButton)

      //Skips the caution portion
      const ContinueButton =  screen.getByRole('button', {name: /continue/i})
      await fireEvent.click(ContinueButton);


      let canvas = null
      //Get the drawing Canvas from the Drawer
      await waitFor(() =>
        canvas = screen.getByTestId('TwoDimensionalCanvas')
      )

      expect(canvas).not.toBeNull()
      canvas.width = 1000
      canvas.height = 1000

      const canvasParent = screen.getByTestId('CanvasParent')
      expect(canvasParent).not.toBeNull()

      const StartDrawingButton = screen.getAllByText('Start Drawing')[0]
      fireEvent.click(StartDrawingButton)
      const ctx = canvas.getContext('2d');
      expect(canvas).not.toBeNull()

      /////////////////////Act -Fire Mouse Events///////////////////////

      //Fire the mouse events to click on two different places 
      let firstclickevent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
        screenX: drawPoints[0].posx,
        screenY: drawPoints[0].posy,
        button: 0,
      })
      let moveEvent = new MouseEvent('mousemove', {
        view: window,
        bubbles: true,
        cancelable: true,
        screenX: drawPoints[1].posx,
        screenY: drawPoints[1].posy,
        button: 0,
      })

      let secondclickevent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
        screenX: drawPoints[1].posx,
        screenY: drawPoints[1].posy,
        button: 0,
      })


      await waitFor(() =>
        fireEvent(canvas, firstclickevent)
      )
      await waitFor(() =>
        fireEvent(canvas, moveEvent)
      )
      await waitFor(() =>
        fireEvent(canvas, secondclickevent)
      )

      const lengthText = screen.getAllByTestId('Length')[0]
      expect(lengthText.innerHTML).toEqual(horizontalLineLenght.toFixed(1).toString())

      recalculateDrawPoints(1)
    })


  })



  describe("clearButtonHandler", () => {

    it("should clear the lines form the canvas onClick", async () => {

      /////////////////////////////////Arrange/////////////////////
      const CustomLayoutButton = screen.getAllByText('CUSTOM LAYOUT')[0]
      await fireEvent.click(CustomLayoutButton)

      //Skips the caution portion
      const ContinueButton =  screen.getByRole('button', {name: /continue/i})
      await fireEvent.click(ContinueButton);

      const canvas = screen.getByTestId('TwoDimensionalCanvas')
      expect(canvas).not.toBeNull()
      let ctx = canvas.getContext('2d');
      ctx.canvas.width = 1000
      ctx.canvas.height = 1000
      const StartDrawingButton = screen.getAllByText('Start Drawing')[0]
      await fireEvent.click(StartDrawingButton)

      ////////////////////////Act/////////////////////////////////
      let firstclickevent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
        screenX: drawPoints[0].posx,
        screenY: drawPoints[0].posy,
        button: 0,
      })

      let secondclickevent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
        screenX: drawPoints[1].posx,
        screenY: drawPoints[1].posy,
        button: 0,
      })
      await waitFor(() =>
        fireEvent(canvas, firstclickevent)
      )
      await waitFor(() =>
        fireEvent(canvas, secondclickevent)
      )
      const clearText = screen.getAllByText('Clear')[0]
      expect(clearText).not.toBeNull()
      await waitFor(() =>
        fireEvent.click(clearText)
      )

      expect(ctx.isPointInPath(drawPoints[0].posx, drawPoints[0].posy)).toBe(false);

    })


  })

  describe("3DViewButtonhandler", () => {

    it("should shows a room with 5 walls is rendered if there are 5 Lines in the line array", async () => {
      jest.clearAllMocks()
      jest.restoreAllMocks();

      jest.spyOn(Wall, 'makeAllCustomWalls').mockResolvedValue({WallArray: [123,234,444,6969], roomID : 1337 })
      jest.spyOn(RoomDB, '_addRoomAndWallsToDB').mockResolvedValueOnce(1337);
      jest.spyOn(RoomDB, 'getAllWalls').mockResolvedValue(resolved5WallsLookup);

      //For the love of god, don't forget about this okay?!
      global.ResizeObserver = require('resize-observer-polyfill')

      ////////////////////////////////////Arrange////////////////////////////
      recalculateDrawPoints(50)
      const CustomLayoutButton = screen.getAllByText('CUSTOM LAYOUT')[0]
      await fireEvent.click(CustomLayoutButton)

      //Skips the caution portion
      const ContinueButton =  screen.getByRole('button', {name: /continue/i})
      await fireEvent.click(ContinueButton);

      const canvas = screen.getByTestId('TwoDimensionalCanvas')
      expect(canvas).not.toBeNull()
      canvas.width = 1000
      canvas.height = 1000

      const StartDrawingButton = screen.getAllByText('Start Drawing')[0]
      await fireEvent.click(StartDrawingButton)
      /////////////////////////////////Act/////////////////////////////////
      let firstclickevent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
        screenX: drawPoints[0].posx,
        screenY: drawPoints[0].posy,
        button: 0,
      })

      let secondclickevent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
        screenX: drawPoints[1].posx,
        screenY: drawPoints[1].posy,
        button: 0,
      })

      let thirdclickevent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
        screenX: drawPoints[2].posx,
        screenY: drawPoints[2].posy,
        button: 0,
      })

      let fourthclickevent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
        screenX: drawPoints[1].posx,
        screenY: drawPoints[2].posy,
        button: 0,
      })

      let fifthclickevent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
        screenX: drawPoints[0].posx,
        screenY: drawPoints[2].posy,
        button: 0,
      })
      await waitFor(() =>
        fireEvent(canvas, firstclickevent)
      )
      await waitFor(() =>
        fireEvent(canvas, secondclickevent)
      )
      await waitFor(() =>
        fireEvent(canvas, thirdclickevent)
      )
      await waitFor(() =>
        fireEvent(canvas, fourthclickevent)
      )
      await waitFor(() =>
        fireEvent(canvas, fifthclickevent)
      )

      await waitFor(() =>
          // fireEvent(canvas, move2)
          fireEvent.mouseMove(canvas, { screenY: drawPoints[0].posx, screenY: drawPoints[0].posy })

      )
      const submitButton = screen.getAllByText('Submit')[0]
      
      await act( () => {
         fireEvent.click(submitButton)     
      });
    
      await waitFor(() => {
        const numRenderedWalls = screen.getByTestId('currentRoom-UI')
        expect(numRenderedWalls).toBeInTheDocument()
      })
      
    });


  })



})