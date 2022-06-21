import React, { useEffect,useState } from 'react';
import { w3cwebsocket as W3CWebSocket } from "websocket";
import { Card, Avatar, Input, Typography } from 'antd';
import 'antd/dist/antd.css';
import './WebSocketComponent.css'

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
  const onButtonClicked = (value) => {
    console.log("'rfz");
    client.send(JSON.stringify({
      type: "message",
      msg: value,
      user: data.userName
    }));
    setData({ ...data,searchVal: '' })
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
            <Search
              placeholder="input message and send"
              enterButton="Send"
              value={data.searchVal}
              size="large"
              onChange={(e) => setData({ ...data,searchVal: e.target.value })}
              onSearch={value => onButtonClicked(value)}
            />
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



