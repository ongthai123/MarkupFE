import React from 'react';
import { userService, authenticationService } from '@/_services';
import './styles.css'
import config from 'config';
import { authHeader, handleResponse } from '@/_helpers';
import { Button, Header, Icon, Image, Modal, Form, Input, Select } from 'semantic-ui-react'
import { PDFAnnotate } from './pdfannotate.js';
var pdf;

$(function () {
    $('.color-tool').click(function () {
        $('.color-tool.active').removeClass('active');
        $(this).addClass('active');
        var color = $(this).get(0).style.backgroundColor;
        pdf.setColor(color);
    });

    $('#brush-size').change(function () {
        var width = $(this).val();
        pdf.setBrushSize(width);
    });

    $('#font-size').change(function () {
        var font_size = $(this).val();
        pdf.setFontSize(font_size);
    });
});

class Test extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentUser: authenticationService.currentUserValue,
            userFromApi: null,
            brushSize: 1,
            openModal: false,
            marks: -1
        };
    }

    componentDidMount() {
        const id = this.props.match.params.id;
        // var markingCriteria = new PDFAnnotate('pdf-container', 'http://localhost:4000/api/marking/979486c2-7aa5-4d3d-b178-08d73ce62b19')
        pdf = new PDFAnnotate('pdf-container', `${config.apiUrl}/api/marking/` + id);

        // const requestOptions = { 
        //     method: 'GET', 
        //     headers: authHeader(),
        //  };
        // fetch(`${config.apiUrl}/api/marking/${id}`, requestOptions)
    }

    handleBrushSize = (e) => {
        // console.log(e.target.value)
        this.setState({ brushSize: e.target.value })
    }

    enableSelector = (event) => {
        event.preventDefault();
        var element = ($(event.target).hasClass('tool-button')) ? $(event.target) : $(event.target).parents('.tool-button').first();
        $('.tool-button.active').removeClass('active');
        $(element).addClass('active');
        pdf.enableSelector();
    }

    enablePencil = (event) => {
        event.preventDefault();
        var element = ($(event.target).hasClass('tool-button')) ? $(event.target) : $(event.target).parents('.tool-button').first();
        $('.tool-button.active').removeClass('active');
        $(element).addClass('active');
        pdf.enablePencil();
    }

    enableAddText = (event) => {
        event.preventDefault();
        var element = ($(event.target).hasClass('tool-button')) ? $(event.target) : $(event.target).parents('.tool-button').first();
        $('.tool-button.active').removeClass('active');
        $(element).addClass('active');
        pdf.enableAddText();
    }

    enableAddArrow = (event) => {
        event.preventDefault();
        var element = ($(event.target).hasClass('tool-button')) ? $(event.target) : $(event.target).parents('.tool-button').first();
        $('.tool-button.active').removeClass('active');
        $(element).addClass('active');
        pdf.enableAddArrow();
    }

    enableRectangle = (event) => {
        event.preventDefault();
        var element = ($(event.target).hasClass('tool-button')) ? $(event.target) : $(event.target).parents('.tool-button').first();
        $('.tool-button.active').removeClass('active');
        $(element).addClass('active');
        pdf.setColor('rgba(255, 0, 0, 0.3)');
        pdf.setBorderColor('blue');
        pdf.enableRectangle();
    }

    deleteSelectedObject = () => {
        event.preventDefault();
        pdf.deleteSelectedObject();
    }

    download = () => {
        pdf.download();
    }

    clearPage = () => {
        pdf.clearActivePage();
    }

    showPdfData = () => {
        var string = pdf.serializePdf();
        $('#dataModal .modal-body pre').first().text(string);
        PR.prettyPrint();
        $('#dataModal').modal('show');
    }

    saveDrawing = () => {
        const {currentUser, marks} = this.state
        const id = this.props.match.params.id;

        let formData = new FormData();
        formData.append('markingId', id)
        formData.append('userId', currentUser.id)
        formData.append('marks', marks)
        formData.append('fileStringBase64', pdf.savePdf())

        const requestOptions = { 
            method: 'POST', 
            headers: authHeader(),
            body: formData
         };
        fetch(`${config.apiUrl}/api/marking/edit`, requestOptions)
        .then(() => this.handleModal())
    }

    handleMark = (e) => {
        let marks = e.target.value;
        this.setState({marks})
    }

    handleModal = () => {
        const { openModal } = this.state

        this.setState({ openModal: !openModal })
    }


    render() {
        const { openModal, marks } = this.state
        return (
            <div>
                <div className="toolbar">
                    <div className="tool">
                        <span>PDFJS + FabricJS + jsPDF</span>
                    </div>
                    <div className="tool">
                        <label htmlFor="">Brush size</label>
                        <input type="number" className="htmlForm-control text-right" value={this.state.brushSize} id="brush-size" max="50" onChange={(e) => this.handleBrushSize(e)}></input>
                    </div>
                    <div className="tool">
                        <label htmlFor="">Font size</label>
                        <select id="font-size" className="htmlForm-control">
                            <option value="10">10</option>
                            <option value="12">12</option>
                            <option value="16" defaultChecked>16</option>
                            <option value="18">18</option>
                            <option value="24">24</option>
                            <option value="32">32</option>
                            <option value="48">48</option>
                            <option value="64">64</option>
                            <option value="72">72</option>
                            <option value="108">108</option>
                        </select>
                    </div>
                    <div className="tool">
                        <button className="color-tool active" style={{ backgroundColor: "#212121" }}></button>
                        <button className="color-tool" style={{ backgroundColor: "red" }}></button>
                        <button className="color-tool" style={{ backgroundColor: "blue" }}></button>
                        <button className="color-tool" style={{ backgroundColor: "green" }}></button>
                        <button className="color-tool" style={{ backgroundColor: "yellow" }}></button>
                    </div>
                    <div className="tool">
                        <button className="tool-button active" onClick={() => this.enableSelector(event)}><i className="fa fa-hand-paper-o" title="Free Hand" ></i></button>
                    </div>
                    <div className="tool">
                        <button className="tool-button" onClick={() => this.enablePencil(event)}><i className="fa fa-pencil" title="Pencil"></i></button>
                    </div>
                    <div className="tool">
                        <button className="tool-button" onClick={() => this.enableAddText(event)}><i className="fa fa-font" title="Add Text" ></i></button>
                    </div>
                    <div className="tool">
                        <button className="tool-button" onClick={() => this.enableAddArrow(event)}><i className="fa fa-long-arrow-right" title="Add Arrow"></i></button>
                    </div>
                    <div className="tool">
                        <button className="tool-button" onClick={() => this.enableRectangle(event)}><i className="fa fa-square-o" title="Add rectangle"></i></button>
                    </div>
                    <div className="tool">
                        <button className="btn btn-danger btn-sm" onClick={() => this.deleteSelectedObject(event)}><i className="fa fa-trash"></i></button>
                    </div>
                    <div className="tool">
                        <button className="btn btn-danger btn-sm" onClick={() => this.clearPage()}>Clear Page</button>
                    </div>
                    {/* <div className="tool">
                        <button className="btn btn-info btn-sm" onClick={() => showPdfData()}>{}</button>
                    </div> */}
                    <div className="tool">
                        <button className="btn btn-light btn-sm" onClick={() => this.download()}><i className="fa fa-save"></i> Download</button>
                    </div>
                    <div className="tool">
                        <button className="btn btn-light btn-sm" onClick={() => this.handleModal()}><i className="download icon"></i> Save</button>
                    </div>
                </div>
                <div id="pdf-container"></div>

                {/* <div className="modal fade" id="dataModal" tabIndex="-1" role="dialog" aria-labelledby="dataModalLabel" aria-hidden="true">
                    <div className="modal-dialog modal-lg" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="dataModalLabel">PDF annotation data</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <pre className="prettyprint lang-json linenums">
                                </pre>
                            </div>
                        </div>
                    </div>
                </div> */}
                <Modal
                    open={openModal}
                    onClose={this.handleModal}
                    size='small'
                    style={{ maxHeight: "300px", verticalAlign: "center", margin: "auto" }}
                >
                    <Modal.Header>Upload Submission</Modal.Header>
                    <Modal.Content>
                        Marks: <Input focus placeholder='Marks...' onChange={this.handleMark} />
                    </Modal.Content>
                    <Modal.Actions>
                        <Button primary onClick={this.saveDrawing} disabled={marks == -1 ? true : false}>
                            Save changes <Icon name='chevron right' />
                        </Button>
                    </Modal.Actions>
                </Modal>
            </div>
        )
    }
}

export { Test };