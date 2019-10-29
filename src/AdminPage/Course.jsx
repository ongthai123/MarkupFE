import React from 'react';
import { Button, Header, Icon, Image, Modal, Form, Input, Select, Confirm } from 'semantic-ui-react'
import { Router, Route, Link } from 'react-router-dom';


import config from 'config';
import { userService, authenticationService } from '@/_services';
import { authHeader, handleResponse, history, Role } from '@/_helpers';

class Course extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentUser: authenticationService.currentUserValue,
            users: null,
            courses: null,
            lecturers: null,
            isCRUDModalOpen: false,
            crudModalTitle: "",
            selectValue: null
        };
    }

    componentDidMount() {
        // userService.getAll().then(users => this.setState({ users }));
        const { currentUser } = this.state;
        userService.getById(currentUser.id).then(userFromApi => this.setState({ userFromApi }));

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

        this.setState({ selectValue, key })
        console.log("Key: ", key)


    }

    onInputHandler = (e) => {
        let inputValue = e.target.value
        this.setState({ inputValue })
        console.log("inputValue: ", inputValue)
    }

    addCourse = () => {
        const { key, inputValue } = this.state

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
    }

    editCourse = () => {
        console.log("Edit")
    }

    handleConfirm = (id) => {
        const { openConfirm } = this.state;

        this.setState({
            openConfirm: !openConfirm,
            deleteId: id
        })
    }

    delete = () => {

        const formData = new FormData();
        formData.append('id', this.state.deleteId)

        fetch(`${config.apiUrl}/api/course/delete`, {
            headers: authHeader(),
            method: 'POST',
            body: formData,
        })
            .then((response => this.loadData()))
            .then(() => this.handleConfirm())
    }

    render() {
        const { users, isCRUDModalOpen, crudModalTitle, courses, lecturers, currentUser, openConfirm } = this.state;

        let tableData = null;

        if (courses != null) {
            if (currentUser.role == Role.Admin) {
                tableData = courses.map(course =>
                    <tr key={course.id}>
                        <td>{course.title}</td>
                        <td>{course.lecturerName}</td>
                        <td>
                            <Link to={"/assignments/" + course.id}><button className="ui brown button"><i className="book icon" style={{ margin: 0 }}></i></button></Link>
                            <Link to={"/students/" + course.id}><button className="ui blue button"><i className="user icon" style={{ margin: 0 }}></i></button></Link>
                            <button className="ui yellow button" onClick={() => this.handleCRUDModal("Edit")}><i className="edit icon" style={{ margin: 0 }}></i></button>
                            <button className="ui red button" onClick={() => this.handleConfirm(course.id)}><i className="trash alternate icon" style={{ margin: 0 }}></i></button>
                        </td>
                    </tr>
                )
            }
            else {
                let filteredList = [];
                courses.forEach(element => {
                    if (element.lecturerID == currentUser.id)
                        filteredList.push(element)
                })

                console.log("filteredList: ", filteredList)

                if (filteredList.length > 0) {
                    tableData = filteredList.map(course =>
                        <tr key={course.id}>
                            <td>{course.title}</td>
                            <td>{course.lecturerName}</td>
                            <td>
                                <Link to={"/assignments/" + course.id}><button className="ui brown button"><i className="book icon" style={{ margin: 0 }}></i></button></Link>
                                <Link to={"/students/" + course.id}><button className="ui blue button"><i className="user icon" style={{ margin: 0 }}></i></button></Link>
                            </td>
                        </tr>
                    )
                }
            }
        }

        const modifiedLecturers = [];

        if (lecturers != null) {
            lecturers.forEach(element => {
                const lecturerObject = {};

                lecturerObject['key'] = element.id;
                lecturerObject['text'] = element.firstName + " " + element.lastName
                lecturerObject['value'] = element.id;

                modifiedLecturers.push(lecturerObject)
            });
        }

        return (
            <div>
                <div className="ui grid">
                    <div className="ten wide column"><h1>Course</h1></div>
                    <div className="six wide column">
                        {currentUser.role == Role.Admin ?
                            <button className="ui inverted green button" style={{ float: "right" }} onClick={() => this.handleCRUDModal("Add")}>Add New</button>
                            :
                            null
                        }
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
                                    label={{ children: 'Lecturer'/*, htmlFor: 'form-select-control-gender'*/ }}
                                    placeholder='Lecturer'
                                    // search
                                    // searchInput={{ id: 'form-select-control-gender' }}
                                    // value={this.state.selectValue} 
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

                <Confirm
                    open={openConfirm}
                    onCancel={this.handleConfirm}
                    onConfirm={this.delete}
                    size='tiny'
                    content='Do you want to DELETE this?'
                    style={{ maxHeight: "200px", verticalAlign: "center", margin: "auto" }}
                />

            </div>
        );
    }
}

export { Course };