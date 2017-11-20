import React from 'react';
import './style.css';

function List(props) {
  const listItems = props.objects.map((item) => {
    if(item.link){
      return (<li key={item.name}><a href={ item.link }>{ item.name }</a></li>)
    }else {
      return (<li key={item.name}>{ item.name } ({ item.score})</li>)
    }
  });

  return (
    <ul>{ listItems }</ul>
  )
}

export default List;
