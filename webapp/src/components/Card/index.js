import React  from 'react';
import './style.css';

function Card(props) {
  return (
  <div className="card">
    <h1 className="title">{ props.title }</h1>
    <div className="divider"></div>
    { props.children }
  </div>
  )
}

export default Card;
