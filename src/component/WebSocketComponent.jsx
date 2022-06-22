import React, { useEffect,useState } from 'react';
import { w3cwebsocket as W3CWebSocket } from "websocket";
import { Card, Avatar, Input, Typography } from 'antd';
import { Button,Form,Row, Col,InputGroup,FormControl } from 'react-bootstrap'
import 'antd/dist/antd.css';
import './WebSocketComponent.css'
const annyang =require('annyang'); 
const { Search } = Input;
const { Text } = Typography;
const { Meta } = Card;

const client = new W3CWebSocket('ws://127.0.0.1:8000');

export default function WebSocketComponent() {
  const [data, setData]= useState({
    userName: "",
    isLoggedIn: false,
    messages: []
  })
  const voiceAssistant = ()=>{
    if(annyang){
      annyang.debug();
      var commands= {
         '*text': function(text){
          document.getElementById('input').value=text.slice(0,-1);
         } 
        }
      
      annyang.addCommands(commands); 
      annyang.addCallback('soundstart', function() {
        console.log('sound detected');  
      });
      annyang.addCallback('result', function() {
        console.log('sound stopped');
      });
      annyang.start()
    }

  }
  const onButtonClicked = () => {
    client.send(JSON.stringify({
      type: "message",
      msg: document.getElementById('input').value,
      user: data.userName
    }));
    setData({ ...data,searchVal: '' })
    annyang.abort();

  }

  const onSubmit = (value) => {
    // setData({ ...data,isLoggedIn: true, userName: value    })
    setData((state) =>
          ({...state,isLoggedIn: true, userName: value})
        );
  }

  useEffect(() => {
    client.onopen = () => {
      console.log('WebSocket Client Connected');
    };
    client.onmessage = (message) => {
      const dataFromServer = JSON.parse(message.data);
      console.log('got reply! ', dataFromServer);
      if (dataFromServer.type === "message") {
        setData((state) =>
          ({...state,
            messages: [...state.messages,
            {
              msg: dataFromServer.msg,
              user: dataFromServer.user
            }]
          })
        );
      }
    };
  },[])

    return (
      <div className="main" id='wrapper'>
        {data.isLoggedIn ?
        <div>
          <div className="title">
            <Text id="main-heading" type="secondary" style={{ fontSize: '36px' }}>Websocket Chat: {data.userName}</Text>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: 50 }} id="messages">
            {data.messages.map(message => 
              <Card key={message.msg} style={{ width: 300, margin: '16px 4px 0 4px', alignSelf: data.userName === message.user ? 'flex-end' : 'flex-start' }} loading={false}>
                <Meta
                  avatar={
                    <Avatar style={{ color: '#f56a00', backgroundColor: '#fde3cf' }}>{message.user[0].toUpperCase()}</Avatar>
                  }
                  title={message.user+":"}
                  description={message.msg}
                />
              </Card> 
            )}
          </div>
          <div className="bottom">
            {/* <Search
              placeholder="input message and send"
              enterButton="Send"
              value={data.searchVal}
              size="large"
              onChange={(e) => setData({ ...data,searchVal: e.target.value })}
              onSearch={value => onButtonClicked(value)}
            /> */}
            <div style={{display:'flex'}}>
              <input 
              style={{height: '40px',
              width: '-webkit-fill-available'}}
              type='text'
              id='input'
               />
               <input type="button" onClick={voiceAssistant} value="voice"/>
              <input type="Submit" onClick={onButtonClicked} />
            </div>
          </div> 
        </div>
        :
        <div style={{ padding: '200px 40px' }}>
          <Search
            placeholder="Enter Username"
            enterButton="Login"
            size="large"
            onSearch={onSubmit}
          />
        </div>
      }
      </div>
    )

}



