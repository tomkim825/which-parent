import React, { Component } from 'react';
import './App.css';
import firebase from './firebase.js';
import ImageCompressor from 'image-compressor.js';
import $ from "jquery";

var storage = firebase.storage();
var momfile;
var dadfile;
var kidfile;


class App extends Component {

  constructor (props) {
      super(props);
      this.inputMomOpenFileRef = React.createRef(),
      this.inputChildOpenFileRef = React.createRef(),
      this.inputDadOpenFileRef = React.createRef(),

    this.state = {
      momUrl: 'https://tomkim825.github.io/Project1-FaceAPI/assets/images/user-silhouette.png',
      momResult: '',
      momFaceId:'',
      momUploaded: false,
      dadUrl: 'https://tomkim825.github.io/Project1-FaceAPI/assets/images/user-silhouette.png',
      dadResult: '',
      dadFaceId:'',
      dadUploaded: false,
      kidUrl: 'https://tomkim825.github.io/Project1-FaceAPI/assets/images/user-silhouette.png',
     kidResult: '',
     kidFaceId:'',
     kidUploaded: false,
      results: '**click on circles to upload image**',
      momConfidence:'',
      dadConfidence:''
    },
    this.handleMomClick = () => {
      this.inputMomOpenFileRef.current.click();
     
  },this.handleChildClick = () => {
    this.inputChildOpenFileRef.current.click()
   
},this.handleDadClick = () => {
  this.inputDadOpenFileRef.current.click()
 
}, this.check = () =>{
  if(this.state.momUploaded &&this.state.kidUploaded&&this.state.dadUploaded){
    this.setState({results:''})
    var momId = this.state.momFaceId;
    var dadId = this.state.dadFaceId;
    var kidId = this.state.kidFaceId;
    var component = this;
    $.ajax({
      url: "https://westus.api.cognitive.microsoft.com/face/v1.0/verify",
      beforeSend: function(xhrObj){
          // Request headers
          xhrObj.setRequestHeader("Content-Type","application/json");
          xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key","10f397a3144b4015b61663d5d274889c");
      },
      type: "POST",
      // Request body
      data: JSON.stringify({
        "faceId1": kidId,
        "faceId2": momId
      }),
  })
  .done( data => {
    var momResult = parseInt(data.confidence.toFixed(2)*100) + '% match';
    var momConfidence =data.confidence;
    component.setState({momResult, momConfidence})
    if((component.state.dadConfidence !=='') &&( component.state.momConfidence !=='')){
    if(component.state.dadConfidence > component.state.momConfidence){
      component.setState({kidResult: "Looks more like Dad"})
    } else{ component.setState({kidResult: "Looks more like Mom"}) } 
    component.setState({results:'click any circle to try another picture and/or another child'});
    storage.ref().child(dadfile).delete();
    storage.ref().child(momfile).delete();
    storage.ref().child(kidfile).delete();
  }
  }).fail( error => {
    console.log(error);
});
$.ajax({
  url: "https://westus.api.cognitive.microsoft.com/face/v1.0/verify",
  beforeSend: function(xhrObj){
      // Request headers
      xhrObj.setRequestHeader("Content-Type","application/json");
      xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key","10f397a3144b4015b61663d5d274889c");
  },
  type: "POST",
  // Request body
  data: JSON.stringify({
    "faceId1": kidId,
    "faceId2": dadId
  }),
})
.done( data => {
var dadResult = parseInt(data.confidence.toFixed(2)*100) + '% match';
var dadConfidence =data.confidence;
component.setState({dadResult,dadConfidence});
if((component.state.dadConfidence !=='') &&( component.state.momConfidence !=='')){
  if(component.state.dadConfidence > component.state.momConfidence){
    component.setState({kidResult: "Looks more like Dad"})
  } else{ component.setState({kidResult: "Looks more like Mom"}) } 
  component.setState({results:'click any circle to try another picture and/or another child'});
  storage.ref().child(dadfile).delete();
  storage.ref().child(momfile).delete();
  storage.ref().child(kidfile).delete();
}
}).fail( error => {
console.log(error);
});
  }
}
,this.onChangeMomFile = (event) => {
  this.setState({results: 'Compressing Image', momResult:'', dadResult:'',kidResult:''});
  event.stopPropagation();
  event.preventDefault();
  var file = event.target.files[0];
  momfile=file.name;
  var component = this;
  
  new ImageCompressor(file, {
    quality: 0.5,
    success(result) {
      component.setState({  results: 'Uploading'});

  storage.ref().child(momfile).put(result).then( () =>{
  storage.ref().child(momfile).getDownloadURL().then( url => {
    var momUrl = url;
    component.setState({  momUrl, results: '**click on circles to upload image**' ,momUploaded:true });


    $.ajax({
      url: "https://westus.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceId=true",
      beforeSend: function(xhrObj){
          // Request headers
          xhrObj.setRequestHeader("Content-Type","application/json");
          xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key","10f397a3144b4015b61663d5d274889c");
      },
      type: "POST",
      // Request body
      data: JSON.stringify({
          "url": url
          }),
  })
  .done( data => {
        var momFaceId = data[0].faceId;
       component.setState({momFaceId})
       component.check();

  })

  })})     }});
 }
 ,this.onChangeChildFile = (event) => {
  this.setState({results: 'Compressing Image', momResult:'', dadResult:'',kidResult:''});
  event.stopPropagation();
  event.preventDefault();
  var file = event.target.files[0];
 kidfile=file.name;
 var component = this;

 new ImageCompressor(file, {
  quality: 0.5,
  success(result) {
    component.setState({  results: 'Uploading'});

  storage.ref().child(kidfile).put(result).then( () =>{
  storage.ref().child(kidfile).getDownloadURL().then( url => {
    var kidUrl = url;
    component.setState({  kidUrl,results: '**click on circles to upload image**'  ,kidUploaded:true });


    $.ajax({
      url: "https://westus.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceId=true",
      beforeSend: function(xhrObj){
          // Request headers
          xhrObj.setRequestHeader("Content-Type","application/json");
          xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key","10f397a3144b4015b61663d5d274889c");
      },
      type: "POST",
      // Request body
      data: JSON.stringify({
          "url": url
          }),
  })
  .done( data=> {
        var kidFaceId = data[0].faceId;
       component.setState({kidFaceId})
       component.check();
  })

  })})   }});
 }
 ,this.onChangeDadFile = (event) => {
  this.setState({results: 'Compressing Image', momResult:'', dadResult:'',kidResult:''});
  event.stopPropagation();
  event.preventDefault();
  var file = event.target.files[0];
 dadfile=file.name;
 var component = this;

 new ImageCompressor(file, {
  quality: 0.5,
  success(result) {
    component.setState({  results: 'Uploading'});

  storage.ref().child(dadfile).put(result).then( () => {
  storage.ref().child(dadfile).getDownloadURL().then( url => {
    var dadUrl = url;
    component.setState({  dadUrl,  results: '**click on circles to upload image**'  ,dadUploaded:true }); 

    $.ajax({
      url: "https://westus.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceId=true",
      beforeSend: function(xhrObj){
          // Request headers
          xhrObj.setRequestHeader("Content-Type","application/json");
          xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key","10f397a3144b4015b61663d5d274889c");
      },
      type: "POST",
      // Request body
      data: JSON.stringify({
          "url": url
          }),
  })
  .done( data => {
        var dadFaceId = data[0].faceId;
       component.setState({dadFaceId})
       component.check();
  })
  })})  }});
 }

  }

  render() {
    return (
      <div className="App">
       <header className="header">
          <h1 className="title">Mom or Dad:</h1>
          <h5 className="desc">Who do you look like more? </h5>
       </header>
      
      <div className='container' style={{width:'45vh', maxHeight:'86vh',backgroundColor:'white',color:'black', margin:'0 auto',borderRadius:'10px'}}>
     
          <input ref={this.inputMomOpenFileRef} type="file" accept="image/*" style={{display:"none"}} onChange={this.onChangeMomFile}/>
               
          <input ref={this.inputChildOpenFileRef} type="file" accept="image/*" style={{display:"none"}} onChange={this.onChangeChildFile}/>
                    
          <input ref={this.inputDadOpenFileRef} type="file" accept="image/*" style={{display:"none"}} onChange={this.onChangeDadFile}/>
        <div className='pictures'>
        <div className='mom'>
          <img id="mom" alt='userimage' src={this.state.momUrl} onClick={this.handleMomClick} style={{ objectFit: 'contain'}}/>
          <h2 style={{marginTop: '1vmin'}}>Mom</h2>
          <h4>{this.state.momResult}</h4>
        </div>
        <div className='child' >
          <img id="child" alt='userimage' src={this.state.kidUrl} onClick={this.handleChildClick} style={{ objectFit: 'contain'}}/>
          <h2 style={{marginTop: '1vmin'}}>Child</h2>
          <h4>{this.state.kidResult}</h4>
        </div>
        <div className='dad'>
          <img id="dad" alt='userimage' src={this.state.dadUrl} onClick={this.handleDadClick} style={{ objectFit: 'contain'}}/>
          <h2 style={{marginTop: '1vmin'}}>Dad</h2>
          <h4>{this.state.dadResult}</h4>
        </div> 
        </div>
        <div>
        <h3>{this.state.results}</h3>
        <br/>
        <p>Results generated using Microsoft's facial recogntion software</p>
        <p>analyzing 27 data points. For entertainment purposes only</p>
        </div> 

      </div>
      </div>
    );
  }
}

export default App;
