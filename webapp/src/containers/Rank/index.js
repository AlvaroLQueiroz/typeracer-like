import React, { Component }  from 'react';
import Card from '../../components/Card';
import List from '../../components/List';

import './style.css';

const players = [
  {name: "player 1", score: 5},
  {name: "player 2", score: 4},
  {name: "player 3", score: 3},
  {name: "player 4", score: 2},
  {name: "player 5", score: 1},
]
class Rank extends Component {
  render() {
    return (
      <Card title="Rank" >
        <List objects={players} />
      </Card>
    );
  }
}

export default Rank;
