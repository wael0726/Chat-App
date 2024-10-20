import React, { useContext } from 'react';
import "./RightSidebar.css";
import assets from '../../assets/assets';
import { logout } from '../../config/firebase';
import { AppContext } from '../../context/AppContext';

const RightSidebar = () => {
  const { userData } = useContext(AppContext); // Récupérer userData depuis le contexte

  // Vérifiez si userData est défini avant d'essayer d'accéder à ses propriétés
  const avatar = userData ? userData.avatar : assets.avatar; // Valeur par défaut
  const name = userData ? userData.name : "Your Name"; // Valeur par défaut
  const bio = userData ? userData.bio : "Hi, my name is ..."; // Valeur par défaut

  return (
    <div className='rs'>
      <div className="rs-profile">
        <img src={avatar} alt="" />
        <h3>{name}</h3>
        <p>{bio}</p>
      </div>
      <hr />
      <div className="rs-media">
        <p>Media</p>
        <div>
          <img src={assets.pic1} alt="" />
          <img src={assets.pic2} alt="" />
          <img src={assets.pic3} alt="" />
          <img src={assets.pic4} alt="" />
          <img src={assets.pic1} alt="" />
          <img src={assets.pic2} alt="" />
        </div>
      </div>
      <button onClick={() => logout()}>
        Logout
      </button>
    </div>
  );
}

export default RightSidebar;
