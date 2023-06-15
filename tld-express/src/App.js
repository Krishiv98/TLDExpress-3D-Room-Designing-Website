import './App.css';
import TLDExpressLanding from './Components/Core/TLDExpressLanding';
import fontStyle from './theme'
import { ChakraProvider } from '@chakra-ui/react'

function App() {
  return(
    <ChakraProvider theme={fontStyle}>
      <TLDExpressLanding/>
    </ChakraProvider>
  )
}

export default App;