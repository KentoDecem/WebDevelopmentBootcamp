import React from 'react'
import Hero from '../components/Hero/Hero'
import Popular from '../components/Popular/Popular'
import Offers from '../components/Offers/Offers'

// const homepageStyle = {
//   position: "fixed",
//   width: '100%',
//   height: '100vh',
//   top: "0",
//   zIndex: -1,
//   objectFit: "cover"
// }

function Strona_Główna() {
  return (
    <div>
      <Hero />
      <Popular />
      <Offers />
    </div>
  )
}

export default Strona_Główna