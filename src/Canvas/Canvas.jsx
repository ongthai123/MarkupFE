import React from 'react';
import { userService, authenticationService } from '@/_services';
import { fabric } from 'fabric';
import {OutTable, ExcelRenderer} from 'react-excel-renderer';

const options = {
  cMapUrl: 'cmaps/',
  cMapPacked: true,
};

class Canvas extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentUser: authenticationService.currentUserValue,
      userFromApi: null,
      numPages: null,
      pageNumber: 1,
      file: null,
      drawingColor: "black",
      canvas: null
    };
  }

  componentDidMount() {
    const { currentUser } = this.state;
    userService.getById(currentUser.id).then(userFromApi => this.setState({ userFromApi }));

    // var canvas = new fabric.Canvas('canvas');

    // var rect = new fabric.Rect({
    //   top: 100,
    //   left: 100,
    //   width: 60,
    //   height: 70,
    //   fill: 'red'
    // });

    // canvas.add(rect);

    // this.setState({ canvas }, () => this.loadCanvasData())

    // this.loadPdfToCanvas();

  }

  // loadPdfToCanvas = () => {
  //   pdfjsLib.getDocument('http://localhost:4000/api/marking/a5dfad0a-9ecf-4ace-bfa9-08d741b167a9')
  //     .then((pdf) => {
  //       // you can now use *pdf* here
  //       var numPages = pdf.numPages;
  //       var scale = 1.5;
  //       //   pdf.getPage(1).then(function (page) {
  //       //     // you can now use *page* here
  //       //     var viewport = page.getViewport(scale);

  //       //     var canvas = document.getElementById('canvas');
  //       //     var context = canvas.getContext('2d');

  //       //     var renderContext = {
  //       //       canvasContext: context,
  //       //       viewport: viewport
  //       //     };
  //       //     page.render(renderContext)
  //       //   .then(function () {

  //       //     var bg = canvas.toDataURL("image/png");
  //       //     var fcanvas = new fabric.Canvas("canvas", {
  //       //       selection: false
  //       //     });
  //       //     fcanvas.setBackgroundImage(bg, fcanvas.renderAll.bind(fcanvas));

  //       //     var rect = new fabric.Rect({
  //       //       left: 100,
  //       //       top: 100,
  //       //       width: 50,
  //       //       height: 50,
  //       //       fill: '#FF454F',
  //       //       opacity: 0.5,
  //       //       transparentCorners: true,
  //       //       borderColor: "gray",
  //       //       cornerColor: "gray",
  //       //       cornerSize: 5
  //       //     });
  //       //     fcanvas.add(rect);
  //       //     fcanvas.renderAll();
  //       //   });
  //       // });
  //       var viewer = document.getElementById('pdf-viewer');

  //       for (var page = 1; page <= pdf.numPages; page++) {
  //         var canvas = document.createElement("canvas");
  //         canvas.className = 'pdf-page-canvas';
  //         viewer.appendChild(canvas);
  //         this.renderPage(page, canvas, pdf);
  //       }
  //     });

  // }

  // renderPage = (pageNumber, canvas, thePdf) => {
  //   thePdf.getPage(pageNumber).then(function (page) {
  //     var viewport = page.getViewport(1);
  //     page.render({ canvasContext: canvas.getContext('2d'), viewport: viewport })
  //       .then(function () {

  //         var bg = canvas.toDataURL("image/png");
  //         var fcanvas = new fabric.Canvas("canvas", {
  //           selection: false
  //         });
  //         fcanvas.setBackgroundImage(bg, fcanvas.renderAll.bind(fcanvas));
  //       })
  //   });
  // }

  // onFileChange = (event) => {
  //   this.setState({
  //     file: event.target.files[0],
  //   });
  // }

  // onDocumentLoadSuccess = ({ numPages }) => {
  //   this.setState({ numPages });
  // }

  onSelectColor = (event) => {
    // console.log(e.target.value)
    // this.setState({
    //   drawingColor: e.target.value
    // }, () => this.loadCanvasData())

    let fileObj = event.target.files[0];

    //just pass the fileObj as parameter
    ExcelRenderer(fileObj, (err, resp) => {
      if(err){
        console.log(err);            
      }
      // else{
      //   this.setState({
      //     cols: resp.cols,
      //     rows: resp.rows
      //   }, () => {
          console.log("cols: ", resp.cols)
          console.log("rows: ", resp.rows)
      //   });
      // }
    });          
  }

  // loadCanvasData = () => {
  //   const { canvas } = this.state

  //   // canvas.backgroundColor = '#efefef';
  //   canvas.isDrawingMode = 1;
  //   canvas.freeDrawingBrush.color = this.state.drawingColor;
  //   canvas.freeDrawingBrush.width = 1;
  //   canvas.renderAll();
  // }

  // removeDrawing = () => {
  //   const { canvas } = this.state;

  //   canvas.clear();
  //   this.loadPdfToCanvas();
  // }

  // downloadDrawing = () => {
  //   const { canvas } = this.state;

  //   // var imgData = canvas.toDataURL("image/jpeg", 1.0);
  //   // var pdf = new jsPDF();

  //   // pdf.addImage(imgData, 'JPEG', 0, 0);
  //   var pdf = new jsPDF("l", "mm", "a4");
  //   var imgData = canvas.toDataURL('image/jpeg', 1.0);

  //   pdf.addImage(imgData, 'JPEG', 10, 10, 180, 150);
  //   pdf.save("download.pdf");
  // }

  render() {
    const { currentUser, userFromApi, file, numPages } = this.state;
    return (
      <div className="Example">
        <header>
          <h1>react-pdf sample page</h1>
        </header>
        <input type="file" onChange={(e) => this.onSelectColor(e)}></input>
        {/* <button onClick={this.removeDrawing}>Clean</button>
        <button onClick={this.downloadDrawing}>Download</button>
        <canvas id="canvas" width="1000" height="1600"></canvas>
        <div id='pdf-viewer'></div> */}
      </div>
    );
  }
}

export { Canvas };