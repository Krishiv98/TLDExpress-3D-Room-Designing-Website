import React from 'react';
import { screen, render, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import '@testing-library/jest-dom'
import RoomLayoutUI from '../../Components/Core/RoomLayoutUI';
import { describe, beforeEach, afterEach, expect, test } from '@jest/globals';


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
  
  jest.setTimeout(30000)
  window.prompt = jest.fn(()=> 1)

let container


describe("TwoDimentionalDraw.js", () => {


  beforeEach(async () => {
    act(() => {
    
      container = render(<RoomLayoutUI />)

    })

  });

  afterEach(() => {
   
    container = null;
  });


test("that the custom layout button opens custome Layout drawer", async() =>{
   

    let ChooseLayoutModal = screen.getByTestId('ChooseLayoutModal')
    expect(ChooseLayoutModal).not.toBeNull()
    expect(ChooseLayoutModal).toBeInTheDocument()

   let CustomLayoutButton = screen.getAllByText('CUSTOM LAYOUT')[0]
    await fireEvent.click(CustomLayoutButton)
    let canvas = null
    //Get the drawing Canvas from the Drawer
    await waitFor(() =>
      canvas = screen.getByTestId('TwoDimensionalCanvas')
    )    
    expect(canvas).not.toBeNull()
    expect(canvas).toBeInTheDocument()

  });



    //EDITED: changed 3 to 4
  test("should have 3 buttons PLUS the included close button", () =>{

        let ChooseLayoutModal = screen.getByTestId('ChooseLayoutModal')
        expect(ChooseLayoutModal).not.toBeNull()
        expect(ChooseLayoutModal).toBeInTheDocument()

        let buttonsOnScreen =  screen.queryAllByRole('button')

        expect(buttonsOnScreen).toHaveLength(4)


    })
})