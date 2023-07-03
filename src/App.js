import React, { Component } from 'react';
import './App.css';
import firebase from './config/firebase.js';
import ImageCompressor from 'image-compressor.js';
import $ from "jquery";
import subscriptionkey from './config/subscriptionkey.js'

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
      momUrl: 'https://github.com/tomkim825/which-parent/blob/master/src/user-silhouette.png?raw=true',
      momResult: '',
      momFaceId:'',
      momUploaded: false,
      momBorder: 'gray',
      dadUrl: 'https://github.com/tomkim825/which-parent/blob/master/src/user-silhouette.png?raw=true',
      dadResult: '',
      dadFaceId:'',
      dadUploaded: false,
      dadBorder: 'gray',
      kidUrl: 'https://github.com/tomkim825/which-parent/blob/master/src/user-silhouette.png?raw=true',
     kidResult: '',
     kidFaceId:'',
     kidUploaded: false,
     kidBorder:'gray',
      results: '**click on circles to upload image**',
      momConfidence:'',
      dadConfidence:'',
      uploadReady:true,
      warning:''

    },
    this.handleMomClick = () => { 
      if(this.state.uploadReady){
        this.setState({warning:'',uploadReady:false})
      this.inputMomOpenFileRef.current.click(); 
      } else this.setState({warning:'Please wait for last picture to finish'})
    },
    this.handleChildClick = () => { 
      if(this.state.uploadReady){
        this.setState({warning:'',uploadReady:false})
      this.inputChildOpenFileRef.current.click() 
    } else this.setState({warning:'Please wait for last picture to finish'})
    },
    this.handleDadClick = () => { 
      if(this.state.uploadReady){
        this.setState({warning:'',uploadReady:false})
      this.inputDadOpenFileRef.current.click()
    } else this.setState({warning:'Please wait for last picture to finish'})
     },
    this.check = () =>{
  if(this.state.momUploaded &&this.state.kidUploaded&&this.state.dadUploaded){
    this.setState({results:'Analyzing'})
    var momId = this.state.momFaceId;
    var dadId = this.state.dadFaceId;
    var kidId = this.state.kidFaceId;
    var component = this;
    $.ajax({
      url: "https://westus.api.cognitive.microsoft.com/face/v1.0/verify",
      beforeSend: function(xhrObj){
          // Request headers
          xhrObj.setRequestHeader("Content-Type","application/json");
          xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key",subscriptionkey);
      },
      type: "POST",
      // Request body
      data: JSON.stringify({
        "faceId1": kidId,
        "faceId2": momId
      }),
  })
  .done( data => {
    var momResult = parseInt(data.confidence.toFixed(2)*100,10) + '% similar';
    var momConfidence =data.confidence;
    component.setState({momResult, momConfidence})
    if((component.state.dadConfidence !=='') &&( component.state.momConfidence !=='')){
      if(component.state.dadConfidence > component.state.momConfidence){
        component.setState({kidResult: "Looks more like Dad"})
      } else if(component.state.dadConfidence < component.state.momConfidence){ 
        component.setState({kidResult: "Looks more like Mom"}) 
      } else { component.setState({kidResult: "Tie!"}) } 
    component.setState({results:'click any circle to try another picture and/or another child'});
    storage.ref().child(dadfile).delete();
    storage.ref().child(momfile).delete();
    storage.ref().child(kidfile).delete();
  }
  }).fail( error => {
    component.setState({results: error});
});
$.ajax({
  url: "https://westus.api.cognitive.microsoft.com/face/v1.0/verify",
  beforeSend: function(xhrObj){
      // Request headers
      xhrObj.setRequestHeader("Content-Type","application/json");
      xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key",subscriptionkey);
  },
  type: "POST",
  // Request body
  data: JSON.stringify({
    "faceId1": kidId,
    "faceId2": dadId
  }),
})
.done( data => {
var dadResult = parseInt(data.confidence.toFixed(2)*100,10) + '% similar';
var dadConfidence =data.confidence;
component.setState({dadResult,dadConfidence});
if((component.state.dadConfidence !=='') &&( component.state.momConfidence !=='')){
  if(component.state.dadConfidence > component.state.momConfidence){
    component.setState({kidResult: "Looks more like Dad"})
  } else if(component.state.dadConfidence < component.state.momConfidence){ 
    component.setState({kidResult: "Looks more like Mom"}) 
  } else { component.setState({kidResult: "Tie!"}) } 
  component.setState({results:'click any circle to try another picture and/or another child'});
  storage.ref().child(dadfile).delete();
  storage.ref().child(momfile).delete();
  storage.ref().child(kidfile).delete();
}
}).fail( error => {
  component.setState({results: error});
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
    component.setState({  momUrl, results: 'Analyzing' ,momUploaded:true });

    $.ajax({
      url: "https://westus.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceId=true",
      beforeSend: function(xhrObj){
          // Request headers
          xhrObj.setRequestHeader("Content-Type","application/json");
          xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key",subscriptionkey);
      },
      type: "POST",
      // Request body
      data: JSON.stringify({
          "url": url
          }),
  })
  .done( data => {
    component.setState({warning:'', uploadReady:true});
      if(data.length >1 ) {
        component.setState({ results: 'More than 1 Face detected. Please try new picture'})
      } else if(data[0] === undefined){  component.setState({ results: 'Face not detected'})}
      else{var momFaceId = data[0].faceId;
       component.setState({momFaceId, results: '', momBorder:'black', kidResult:''})
       component.check()};

  }) .fail( error => {
    component.setState({results: error});
  });

  })}).catch(error => {
    component.setState({results: error});
   });     }}); 
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
    component.setState({  kidUrl,results: 'Analyzing'  ,kidUploaded:true });


    $.ajax({
      url: "https://westus.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceId=true",
      beforeSend: function(xhrObj){
          // Request headers
          xhrObj.setRequestHeader("Content-Type","application/json");
          xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key",subscriptionkey);
      },
      type: "POST",
      // Request body
      data: JSON.stringify({
          "url": url
          }),
  })
  .done( data=> {
    component.setState({warning:'', uploadReady:true});
    if(data.length >1 ) {
      component.setState({results: 'More than 1 Face detected. Please try new picture'})
    } else if(data[0] === undefined){  component.setState({results: 'Face not detected'})}
       else {
        var kidFaceId = data[0].faceId;
        component.setState({kidFaceId,results: '', kidBorder:'black' });
       component.check();}
  }) .fail( error => {
    component.setState({results: error});
  });

  })}).catch(error => {
    component.setState({results: error});
   });   }});
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
    component.setState({  dadUrl,  results: 'Analyzing'  ,dadUploaded:true }); 

    $.ajax({
      url: "https://westus.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceId=true",
      beforeSend: function(xhrObj){
          // Request headers
          xhrObj.setRequestHeader("Content-Type","application/json");
          xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key",subscriptionkey);
      },
      type: "POST",
      // Request body
      data: JSON.stringify({
          "url": url
          }),
  })
  .done( data => {
    component.setState({warning:'', uploadReady:true});
    if(data.length >1 ) {
      component.setState({ kidResult:'', results: 'More than 1 Face detected. Please try new picture'})
    } if(data[0] === undefined){  component.setState({ results: 'Face not detected'})}
    else{    var dadFaceId = data[0].faceId;
       component.setState({dadFaceId, results: '', dadBorder:'black' })
       component.check();}
  }) .fail( error => {
    component.setState({results: error});
  });
  })}).catch(error => {
    component.setState({results: error});
   });  }});
}

  }

  render() {
    return (
      <div className="App">
        Thank you for using this app. Unfortunately, the facial recognition feature is no longer available and this app will no longer work. It was been removed from the app store. Please delete this app. Sorry for the inconvenience

      </div>
    );
  }
}

export default App;
