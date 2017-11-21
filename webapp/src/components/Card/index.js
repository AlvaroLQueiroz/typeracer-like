import React  from 'react';
import './style.css';

function Card(props) {
  const classes = props.classes ? props.classes : ''
  return (
  <div className={"card " + classes}>
    <h1 className="title">{ props.title }</h1>
    <div className="divider"></div>
    { props.children }
  </div>
  )
}

export default Card;
