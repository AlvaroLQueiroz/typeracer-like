import React from 'react';
import './style.css';

function List(props) {
  const listItems = props.objects.map((item) => {
    const status = item.name === props.activeItem ? 'active' : '';
    if(item.score){
      return (
        <li key={item.name} className={status} onClick={props.handleClick}>
          { item.name } ({ item.score})
        </li>
      )
    }else {
      return (
        <li key={item.name} className={status} onClick={props.handleClick}>
          <a>{ item.name }</a>
        </li>
      )
    }
  });

  return (
    <ul>{ listItems }</ul>
  )
}

export default List;
