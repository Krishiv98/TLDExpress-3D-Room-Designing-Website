import { Component, useEffect } from "react";
import { ChakraProvider as div, FormControl, FormErrorMessage, FormLabel, IconButton, Spacer, Stack } from '@chakra-ui/react'
import {
    Modal,
    useDisclosure,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    Image,
    Input,
    Text,
    Flex,
    Box,
    Container, VStack
} from '@chakra-ui/react'
import { useState } from "react";
import Room from './Room'
import { makeAllWalls } from "./Wall";
import { TwoDimentionalDraw } from '../Features/TwoDimentionalDraw.js';
import TLDExpressSelection from '../Core/TLDExpressSelection';
let modalComplete = false;
let roomID ;
let numberOfWalls;
let make2DViewVisible = false

export default class RoomLayoutUI extends Component {

    constructor() {
        super()
    }

    render() {
        return (
            <div data-testid="ChooseLayoutModal">
                <LaunchModal />
            </div>
        )
    }
}

export function set2DViewVisibility(isVisible){

    make2DViewVisible = isVisible
   
}



function LaunchModal() {
    // required for modal
    const { isOpen, onOpen, onClose } = useDisclosure()
    // state for Modal
    const [ModalType, setModalType] = useState("Layout")
    // length state values
    const [wallLength, setWallLength] = useState()
    // width state values
    const [wallWidth, setWallWidth] = useState()
    // Validation state values
    const [noError, setError] = useState(true)

    const [is2DViewVisible, set2DView] = useState(false)
    const [isParentModalVisible, setParentModalVisibility] = useState(true)
    const [mouseHover, setMouseHover] = useState(false);
    const [mouseSecondHover, setMouseSecondHover] = useState(false);
    const [mouseThirdHover, setMouseThirdHover] = useState(false);
    // On load this will launch the modal to select layout
    // when modals are submitted this will NOT laucnh the modals
    useEffect(() => {
        if (!modalComplete) {
            onOpen()
        }
    })

    /** 
     * function that opent the choose layout option Modal
     * modal will (*Currently*) include only 2 buttons with an image of what th room latout will be
     * the buttons will change the content of the modals for more info on the rooms
     */
    function ChooseLayoutModal() {
        return (
            <ModalContent maxW="75%">
                <ModalHeader fontSize={"5xl"} pb="0" textAlign={'center'}>Choose Layout</ModalHeader>
                <ModalBody pb="2em">
                <ModalCloseButton onClick={() => {
                    onClose();
                    setModalType("RETURN")
                }}/>
                    <Text pb="1em" textAlign={'center'} fontSize={"lg"}> Please Select a Room Layout from the options below</Text>
                    <Flex alignContent={"center"} justifyContent={"center"} paddingLeft="10" paddingRight="10" w={'100%'}>
                        <Box as='button' borderRadius='lg' boxShadow='lg'
                            onMouseOver={() => setMouseHover(true)} 
                            onMouseOut={() => setMouseHover(false)} 
                            onClick={() => setModalType("Square")}
                            bg={mouseHover ? "#333333" : "white"} margin="2" padding="3">
                            <VStack align='center' spacing={2}>
                                <img src={mouseHover ? "./room_onhover.png" : "./room_offhover.png"} alt=""/>
                                <Text fontWeight='bold' textAlign="center"  color={mouseHover ? "white" : "black"} fontSize='3xl'>SQUARE</Text>
                            </VStack>
                        </Box>
                        <Box as='button' borderRadius='lg' boxShadow='lg'
                            onMouseOver={() => setMouseSecondHover(true)} 
                            onMouseOut={() => setMouseSecondHover(false)} 
                            onClick={() => setModalType("Rectangle")}
                            bg={mouseSecondHover ? "#333333" : "white"} margin="2" padding="3">
                            <VStack align='center' spacing={2}>
                                <img src={mouseSecondHover ? "./recroom_onhover.png" : "./recroom_offhover.png"} alt=""/>
                                <Text fontWeight='bold' textAlign="center"  color={mouseSecondHover ? "white" : "black"} fontSize='3xl'>RECTANGLE</Text>
                            </VStack>
                        </Box>
                        <Box as='button' borderRadius='lg' boxShadow='lg'
                            onMouseOver={() => setMouseThirdHover(true)} 
                            onMouseOut={() => setMouseThirdHover(false)} 
                            onClick={() => {
                                onClose();
                                set2DView(true);
                            }}
                            bg={mouseThirdHover ? "#333333" : "white"} margin="2" padding="3">
                            <VStack align='center' spacing={2}>
                                <img src={mouseThirdHover ? "./drawroom_onhover.png" : "./drawroom_offhover.png"} alt=""/>
                                <Text fontWeight='bold' textAlign="center"  color={mouseThirdHover ? "white" : "black"} fontSize='3xl'>CUSTOM LAYOUT</Text>
                            </VStack>
                        </Box>
                    </Flex>
                </ModalBody>
            </ModalContent>
        )
    }


    function onSubmitSquareHandler(e){
        if (wallLength && wallLength >= 0.1 && wallLength < 25)
        {
            SubmitMethod()
        } else {
            setError(false)
        }
    }

    /**
     * this function wil change the contents of the modal to the 
     * modal will include 2 buttons:
     * Cancel which returns to the choose layout Modal
     * Submit which runs validation on the values and show error messages if needed
     *  -If no errors will launch a room with proper dimensions
     * 
     */
    function SquareRoomLayoutModal() { 
        return(

            <form onSubmit={e=>{e.preventDefault();}}>
            <ModalContent data-testid='square-modal'>
                <ModalHeader fontSize={'3xl'} pb="0">Square Modal</ModalHeader>
                {/* <ModalCloseButton /> should be deleted when finished */}
                <ModalBody>

                    <Text fontSize={'md'} pb='1em'> Pleaase Enter a Wall Length (in Meters) for your square room</Text>
                    <Input type="number" value={wallLength} onChange={(e) => { setWallLength(parseFloat(e.target.value)) }}
                        placeholder='Length' width='250px' borderColor={'gray.500'}></Input>
                    {noError == false ? (
                        <div style={{ color: "#ff0000" }}>
                            The Wall Lengths must be between 0.1 and 25 Meters
                        </div>) : <p></p>
                    }
                </ModalBody>

                <ModalFooter>

                <Button variant='ghost' mr={3} onClick={() => { // this Button will take you back to the previous page, as well as clearing the Length and Width and the Errors
                        setError(true)
                        setWallLength('')
                        setModalType("Layout")
                    }}>Cancel</Button>
                    <Button colorScheme='blue' type="submit" onClick={(e)=>onSubmitSquareHandler(e)}>Submit</Button>

                </ModalFooter>
            </ModalContent>
        </form>
        )
    }

    function onSubmitRectangleHanlder(){

        if (wallLength && wallWidth && wallLength >= 0.1 && wallLength < 25 && wallWidth >= 0.1 && wallWidth < 25)
        {
            SubmitMethod()
        } else {
            setError(false)
        }
    }

    /**
     * this function wil change the contents of the modal to the 
     * modal will include 2 buttons:
     * Cancel which returns to the choose layout Modal
     * Submit which runs validation on the values and show error messages if needed
     *  -If no errors will launch a room with proper dimensions
     * 
     */
    function RectangleRoomLayoutModal() {
        return(
            <form onSubmit={e=>{e.preventDefault();}}>
            <ModalContent>
                <ModalHeader fontSize={'3xl'} pb="0">Rectangle Modal</ModalHeader>
                {/* <ModalCloseButton /> should be deleted when finished */}
                <ModalBody>
                    <Text fontSize={'md'} pb='1em'> Please Enter the Wall Dimensions (in Meters) for your rectangular room</Text>
                    <FormControl isRequired>
                        <Stack spacing={3}>
                            <Input type="number" value={wallLength} onChange={(e) => { setWallLength(parseFloat(e.target.value)) }} placeholder='Length' width='250px' borderColor={'gray.500'}></Input>
                            <Input type="number" value={wallWidth} onChange={(e) => { setWallWidth(parseFloat(e.target.value)) }} placeholder='Width' width='250px' borderColor={'gray.500'}></Input>
                            {noError == false ? (
                                <div style={{ color: "#ff0000" }}>
                                    Length and Width must both be between 0.1 and 25 Meters
                                </div>) : <p></p>
                            }
                        </Stack>

                    </FormControl>
                </ModalBody>

                <ModalFooter>
                <Button variant='ghost' mr={3} onClick={() => { // this Button will take you back to the previous page, as well as clearing the Length and Width and the Errors
                        setError(true)
                        setWallWidth('')
                        setModalType("Layout")
                    }}>Cancel</Button>
                    <Button colorScheme='blue' type='submit' onClick={(e) => onSubmitRectangleHanlder(e) }>Submit</Button>
                </ModalFooter>
            </ModalContent>
        </form>
        )
    }

    /**
     * This method will fire when the modal's forms have been filled out with valid information. It will then reset and close the modal, and begin rendering the rest of the room;
     */
    async function SubmitMethod(){
        if(ModalType == "Square")
        {
            await TurnOnRoom(wallLength,wallLength) // begin Rendering the Room, using only the Length as the measurements
        }
        else
        {
            await TurnOnRoom(wallLength,wallWidth) // begin Rendering the Room, using both the Length and the Width as measurements
        }
        onClose() // close the modal.
        setModalType("Layout") // Reset the Modal to layout mode, incase you get back into it somehow.
    }

    function open2DView() {
        
        return (
            <TwoDimentionalDraw close2DView={close2DView} closeParentModal={closeModal} 
            roomRenderStuff={RenderRoomStuff}  setStateNumerOfWalls={setStateNumerOfWalls} setRoomID={setRoomID}
            />
        )
        
    }

    async function setStateNumerOfWalls(num)
    {
        
        numberOfWalls = num
       
    }
    async function setRoomID(num)
    {
      
        roomID = num
       
    }

    function closeModal(){

        modalComplete = true
        onClose() // close the modal.
        setParentModalVisibility(false)        
        
    }
    
    function close2DView() {
        
        set2DView(false)
        modalComplete = false
        
    }

    /**
     * this return creates the basic modal, and selects which of the previous functions are to be used to fill in the body of the modal.
     */
    if (ModalType === "RETURN") 
    {
        return (
            <TLDExpressSelection currentState={false} currentFormState={false}/>
        )
    }
    return (
        
        <Container backgroundColor='#323232' h='calc(100vh)' maxW='100vw' padding={0} data-testid='room-layout-ui'>
            <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false} closeOnEsc={false} size={'xl'}>
                <ModalOverlay />

                {ModalType == "Layout" && // If statements that will fill in the body of the modal, based on the State value ModalType. This one is default
                    ChooseLayoutModal()
                }
                {ModalType == "Square" &&
                    SquareRoomLayoutModal()
                }
                {ModalType == "Rectangle" &&
                    RectangleRoomLayoutModal()
                }
            </Modal>

            {is2DViewVisible == true && 
                 
                open2DView()
            }
        
            {roomID !== undefined &&
                 <RenderRoomStuff />
            }
             
        </Container>
    )
   
}


/**
 * This method will run the Logic and Database code, and then activate the Rendering of the Room
 * TODO Maybe add in a Loading Modal to the modal above, based on modalComplete?
 * @param {double} length 
 * @param {double} width 
 */
async function TurnOnRoom(length,width){
    
    const theReturnedStuff = await makeAllWalls(length,width)

    numberOfWalls = theReturnedStuff.WallArray.length
    roomID = theReturnedStuff.roomID
    modalComplete = true
}

/**
 * This method will wait for the Modal to be marked as complete. Once that has happened, the rest of the room will render
 * @returns 
 */
function RenderRoomStuff(props) {

  
    let ID = roomID
    let walls = numberOfWalls
  
    if (modalComplete === true) {
      
        return (
            <div className="App" data-testid='currentRoom-UI'>
                <Room roomID={ID} numberOfWalls={walls} />
            </div>
        )
    }
}
