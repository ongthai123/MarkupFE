import React from 'react';
import { Button, Header, Icon, Image, Modal, Form, Input, Select } from 'semantic-ui-react'
import { Router, Route, Link } from 'react-router-dom';

import config from 'config';
import { userService, authenticationService } from '@/_services';
import { authHeader, handleResponse } from '@/_helpers';

class Course extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            users: null,
            courses: null,
            lecturers: null,
            isCRUDModalOpen: false,
            crudModalTitle: "",
            selectValue: null
        };
    }

    componentDidMount() {
        userService.getAll().then(users => this.setState({ users }));

        this.loadData();
    }

    loadData = () => {
        const requestOptions = { method: 'GET', headers: authHeader() };
        fetch(`${config.apiUrl}/api/course`, requestOptions)
            .then(r => r.json().then(data => ({ status: r.status, body: data })))
            .then(obj => {
                console.log("Courses: ", obj.body)
                this.setState({
                    courses: obj.body
                })
            });

        fetch(`${config.apiUrl}/api/users/getallusers`, requestOptions)
            .then(r => r.json().then(data => ({ status: r.status, body: data })))
            .then(obj => {
                console.log("Lecturers: ", obj.body)
                this.setState({
                    lecturers: obj.body
                })
            });
    }

    handleCRUDModal = (crudModalTitle) => {
        const { isCRUDModalOpen } = this.state;

        this.setState({ crudModalTitle })

        this.setState({ isCRUDModalOpen: !isCRUDModalOpen })
    }

    onSelectHandler = (event, data) => {

        let selectValue = event.target.textContent;
        // console.log(selectValue);

        
        const { key } = data.options.find(o => o.text === selectValue);
        
        this.setState({selectValue, key})
        console.log("Key: ", key)
        

    }

    onInputHandler = (e) => {
        let inputValue = e.target.value
        this.setState({inputValue})
        console.log("inputValue: ", inputValue)
    }

    addCourse = () => {
        const {key, inputValue} = this.state

        let formData = new FormData();
        formData.append('lecturerId', key)
        formData.append('title', inputValue)

        const requestOptions = { 
            method: 'POST', 
            headers: authHeader(), 
            body: formData
        
        };
        fetch(`${config.apiUrl}/api/course/create`, requestOptions)
        .then(() => this.handleCRUDModal(""))
        .then(() => this.loadData())
            // .then(r => r.json().then(data => ({ status: r.status, body: data })))
            // .then(obj => {
            //     console.log("Courses: ", obj.body)
            //     this.setState({
            //         courses: obj.body
            //     })
            // });
    }

    editCourse = () => {
        console.log("Edit")
    }

    deleteCourse = () => {
        console.log("Delete")
    }

    render() {
        const { users, isCRUDModalOpen, crudModalTitle, courses, lecturers } = this.state;

        let tableData = null;

        if (courses != null) {
            tableData = courses.map(course =>
                <tr key={course.id}>
                    <td>{course.title}</td>
                    <td>{course.lecturerName}</td>
                    <td>
                        <Link to={"/assignments/" + course.id}><button className="ui brown button"><i className="book icon" style={{ margin: 0 }}></i></button></Link>
                        <Link to={"/students/" + course.id}><button className="ui blue button"><i className="user icon" style={{ margin: 0 }}></i></button></Link>
                        <Link to={"/submissions/" + course.id}><button className="ui pink button"><i className="user icon" style={{ margin: 0 }}></i></button></Link>
                        <button className="ui yellow button" onClick={() => this.handleCRUDModal("Edit")}><i className="edit icon" style={{ margin: 0 }}></i></button>
                        <button className="ui red button" onClick={() => this.handleCRUDModal("Delete")}><i className="trash alternate icon" style={{ margin: 0 }}></i></button>
                    </td>
                </tr>
            )
        }

        let lecturerData = null;
        const modifiedLecturers = [];

        if (lecturers != null) {
            lecturers.forEach(element => {
                const lecturerObject = {};

                lecturerObject['key'] = element.id;
                lecturerObject['text'] = element.firstName + " " + element.lastName

                modifiedLecturers.push(lecturerObject)
            });

            lecturerData = modifiedLecturers.map(lecturer =>
                <option key={lecturer.key} value={lecturer.key}>{lecturer.text}</option>
            )
        }



        return (
            <div>
                <div className="ui grid">
                    <div className="ten wide column"><h1>Course</h1></div>
                    <div className="six wide column">
                        <button className="ui inverted green button" style={{ float: "right" }} onClick={() => this.handleCRUDModal("Add")}>Add New</button>
                    </div>
                </div>
                <table className="ui selectable inverted table" style={{ textAlign: "center" }}>
                    <thead>
                        <tr><th>Title</th>
                            <th>Lecturer</th>
                            <th>Action</th>
                        </tr></thead>
                    <tbody>
                        {tableData}
                    </tbody>
                </table>

                {/* CRUD Modal Start */}
                <Modal open={isCRUDModalOpen} onClose={() => this.handleCRUDModal("")} size="small" style={{ maxHeight: "300px", verticalAlign: "center", margin: "auto" }}>
                    <Modal.Header>{crudModalTitle}</Modal.Header>
                    <Modal.Content>
                        {/* <div className="ui grid">
                            <div className="row">
                                <div className="eight wide column" style={{margin: "auto", verticalAlign:"center", textAlign:"center"}}>
                                    <div >
                                        <div className="row">Title</div>
                                        <div className="row">
                                            <div className="ui input">
                                                <input type="text" placeholder="Title..." />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="eight wide column">
                                    <div className="row">
                                        Lecturer
                                    </div>
                                    <div className="row">
                                        <select className="ui search dropdown" placeholder>
                                            <option disabled value="0">Select A Lecturer</option>
                                            {lecturerData}
                                        </select>
                                    </div>
                                </div>
                            </div> */}
                        <Form>
                            <Form.Group widths='equal'>
                                <Form.Field
                                    id='form-input-control-first-name'
                                    control={Input}
                                    label='Title'
                                    placeholder='Title'
                                    onChange={this.onInputHandler}
                                />
                                <Form.Field
                                    control={Select}
                                    options={modifiedLecturers}
                                    label={{ children: 'Lecturer', htmlFor: 'form-select-control-gender' }}
                                    placeholder='Lecturer'
                                    search
                                    searchInput={{ id: 'form-select-control-gender' }}
                                    value={this.state.selectValue} 
                                    // key={modifiedLecturers.key}
                                    onChange={this.onSelectHandler}

                                />

                            </Form.Group>
                        </Form>
                        {/* </div> */}
                    </Modal.Content>
                    <Modal.Actions>
                        {crudModalTitle == "Add" ?
                            <Button primary onClick={() => this.addCourse()}>
                                {crudModalTitle} <Icon name='chevron right' />
                            </Button>
                            : crudModalTitle == "Edit" ?
                                <Button primary onClick={() => this.editCourse()}>
                                    {crudModalTitle} <Icon name='chevron right' />
                                </Button>
                                :
                                <Button primary onClick={() => this.deleteCourse()}>
                                    {crudModalTitle} <Icon name='chevron right' />
                                </Button>
                        }
                    </Modal.Actions>
                </Modal>
                {/* CRUD Modal End */}

            </div>
        );
    }
}

export { Course };