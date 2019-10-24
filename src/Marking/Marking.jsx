import React from 'react';
import { Router, Route, Link } from 'react-router-dom';
import { Button, Header, Icon, Image, Modal, Form, Input, Select } from 'semantic-ui-react'
import config from 'config';
import { userService, authenticationService } from '@/_services';
import { authHeader, handleResponse } from '@/_helpers';
import { Student } from '../AdminPage/Student';

class Marking extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentUser: authenticationService.currentUserValue,
            userFromApi: null,
            submissions: null,
            students: null,
            assignments: null,
            files: [],
            openPreviewModal: false,
            openUploadModal: false,
        };
    }

    componentDidMount() {
        const { currentUser } = this.state;
        userService.getById(currentUser.id).then(userFromApi => this.setState({ userFromApi }));

        this.loadData();
    }

    loadData = () => {
        const id = this.props.match.params.id;
        const requestOptions = { method: 'GET', headers: authHeader() };
        fetch(`${config.apiUrl}/api/marking/getall/${id}`, requestOptions)
            .then(r => r.json().then(data => ({ status: r.status, body: data })))
            .then(obj => {
                console.log("Markings: ", obj.body)
                this.setState({
                    submissions: obj.body
                })
            });

        // fetch(`${config.apiUrl}/api/assignment/${id}`/*, requestOptions*/)
        //     .then(r => r.json().then(data => ({ status: r.status, body: data })))
        //     .then(obj => {
        //         console.log("Assignments: ", obj.body)
        //         this.setState({
        //             assignments: obj.body
        //         })
        //     });

        // fetch(`${config.apiUrl}/api/student/${id}`/*, requestOptions*/)
        //     .then(r => r.json().then(data => ({ status: r.status, body: data })))
        //     .then(obj => {
        //         console.log("Students: ", obj.body)
        //         this.setState({
        //             students: obj.body
        //         })
        //     });
    }

    handleCRUDModal = () => {

    }

    handleUploadModal = () => {
        const { openUploadModal } = this.state;

        this.setState({
            openUploadModal: !openUploadModal
        })
    }

    handleCurrentSubmission = (studentId, assignmentId) => {
        this.setState({
            studentId,
            assignmentId
        })
        // console.log(studentId + "- " + assignmentId)
        this.handleUploadModal();
    }

    addNewMarking = () => {
        const { currentUser } = this.state;
        const id = this.props.match.params.id;

        let formData = new FormData();
        formData.append('userId', currentUser.id)
        formData.append('submissionId', id)

        const requestOptions = {
            method: 'POST',
            headers: authHeader(),
            body: formData
        };
        fetch(`${config.apiUrl}/api/marking/create`, requestOptions)
            .then(() => this.loadData())
        // .then(r => r.json().then(data => ({ status: r.status, body: data })))
        // .then(obj => {
        //     console.log("Markings: ", obj.body)
        //     this.setState({
        //         submissions: obj.body
        //     })
        // });
    }

    // onFileHandler = (e) => {

    //     console.log("E: ", e.target.files)
    //     console.log("assignment: ", this.state.assignmentId)
    //     console.log("student: ", this.state.studentId)

    //     let files = [];

    //     Array.from(e.target.files).forEach(file => {
    //         files.push(file)
    //     });
    //     this.setState({ files }, () => this.saveFiles(files))
    // }

    // saveFiles = (uploadFiles) => {
    //     const { currentUser, assignmentId, studentId } = this.state;

    //     console.log(uploadFiles)
    //     console.log(currentUser.id + studentId + assignmentId)

    //     const files = new FormData();

    //     for (const file of uploadFiles) {
    //         files.append('files', file);
    //         files.append('userId', currentUser.id)
    //         files.append('assignmentId', assignmentId)
    //         files.append('studentId', studentId)
    //     }

    //     fetch(`${config.apiUrl}/api/marking/create`, {
    //         headers: authHeader(),
    //         method: 'POST',
    //         body: files,
    //     })
    //         .then((response => this.loadData()))

    // }

    // editFile = () => {

    // }

    // deleteFile = (submission) => {
    //     // console.log(submission)

    //     const id = submission.id;

    //     console.log(id)
    //     const formData = new FormData();
    //     formData.append('Id', id)

    //     for (var value of formData.entries()) {
    //         console.log(value);
    //     }
    //     fetch(`${config.apiUrl}/api/marking/delete`, {
    //         headers: authHeader(),
    //         method: 'POST',
    //         body: formData,
    //     })
    //         .then((response => this.loadData()))
    // }

    // assignModerator = () => {

    // }

    previewFile = (submission) => {
        fetch(`${config.apiUrl}/api/marking/${submission.id}`, {
            headers: authHeader(),
            method: 'GET',
        })
            .then(r => {
                console.log("Submissions: ", r)
            });
        this.setState({
            apiUrl: `${config.apiUrl}/api/marking/` + submission.id
        })
    }

    sendEmail = (marking) => {
        const { currentUser } = this.state;
        const id = this.props.match.params.id;

        let formData = {};
        formData['user'] = currentUser
        formData['markingId'] = marking.id
        formData['student'] = marking.student

        const requestOptions = {
            method: 'POST',
            headers: {...authHeader(), ...{
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }},
            body: JSON.stringify(formData)
        };
        fetch(`${config.apiUrl}/api/marking/send`, requestOptions)

    }

    render() {
        const { currentUser, userFromApi, submissions, assignments, students, files, openUploadModal } = this.state;

        let tableData = null;
        if (submissions != null) {
            tableData = submissions.map(submission =>
                <tr key={submission.id}>
                    <td data-label="Student">{submission.student.firstName + " " + submission.student.lastName}</td>
                    <td data-label="Updated By">{submission.updatedBy.firstName + " " + submission.updatedBy.lastName}</td>
                    <td data-label="Updated On">{submission.updatedOn}</td>
                    {/* <td data-label="Updated On">{submission.updatedOn}</td> */}
                    <td data-label="Grade">{submission.grade ? submission.grade : 'Unmarked'}</td>
                    <td>
                        <button className="ui black button" onClick={() => this.sendEmail(submission)}><i className="mail icon" style={{ margin: 0 }}></i></button>
                        <a href={this.state.apiUrl} onClick={() => { this.previewFile(submission) }} target="_blank"><button className="ui primary button"><i className="eye icon" style={{ margin: 0 }}></i></button></a>
                        <Link to={"/test/" + submission.id} ><button className="ui yellow button"><i className="edit icon" style={{ margin: 0 }}></i></button></Link>
                        <button className="ui red button" onClick={() => { this.deleteFile(submission) }}><i className="trash alternate icon" style={{ margin: 0 }}></i></button>
                    </td>
                </tr>
            )
        }

        // let listData = [];

        // let assignmentData = null;
        // if (assignments != null && students != null) {

        //     assignments.forEach(assignment => {
        //         students.forEach(student => {
        //             listData.push({
        //                 studentId: student.id,
        //                 studentName: student.firstName + " " + student.lastName,
        //                 email: student.email,
        //                 assignmentId: assignment.id,
        //                 courseTitle: student.courseTitle
        //             })
        //         });
        //     });

        //     console.log("listData: ", listData)


        //     assignmentData = assignments.map(assignment =>
        //         <div key={assignment.id}>
        //             <div className="ui grid">
        //                 <div className="ten wide column"><h1>{assignment.title}</h1></div>
        //                 <div className="six wide column">
        //                     {/* <button className="ui inverted green button" style={{ float: "right" }} onClick={() => this.handleCRUDModal("Add")}>Add New</button> */}
        //                 </div>
        //             </div>
        //             <table className="ui selectable inverted table" style={{ textAlign: "center" }}>
        //                 <thead>
        //                     <tr><th>Course</th>
        //                         <th>Name</th>
        //                         <th>Email</th>
        //                         <th>Grade</th>
        //                         <th>Updated On</th>
        //                         <th>Moderator</th>
        //                         <th>Action</th>
        //                     </tr></thead>
        //                 <tbody>
        //                     {listData.map(student =>
        //                         student.assignmentId == assignment.id ?
        //                             <tr key={student.studentId}>
        //                                 <td>{student.courseTitle}</td>
        //                                 <td>{student.studentName}</td>
        //                                 <td>{student.email}</td>
        //                                 <td></td>
        //                                 <td></td>
        //                                 <td></td>
        //                                 <td>
        //                                     {/* <label htmlFor="hidden-new-file" className="ui green button">
        //                                         <i className="cloud upload icon" style={{ margin: 0 }}></i>
        //                                         <input type="file" id="hidden-new-file" accept="application/pdf" style={{ display: "none" }} onChange={this.onFileHandler}></input>
        //                                     </label> */}
        //                                     <button className="ui green button" onClick={() => { this.handleCurrentSubmission(student.studentId, student.assignmentId) }}><i className="cloud upload icon" style={{ margin: 0 }}></i></button>
        //                                     <button className="ui violet button" onClick={() => console.log(student.assignmentId)}><i className="search icon" style={{ margin: 0 }}></i></button>
        //                                     <button className="ui yellow button" onClick={() => this.handleCRUDModal("Edit")}><i className="edit icon" style={{ margin: 0 }}></i></button>
        //                                     <button className="ui red button" onClick={() => this.handleCRUDModal("Delete")}><i className="trash alternate icon" style={{ margin: 0 }}></i></button>
        //                                 </td>
        //                             </tr>
        //                             :
        //                             null

        //                     )}
        //                 </tbody>
        //             </table>
        //         </div>
        //     )
        // }

        return (
            <div>
                <div className="ui grid">
                    <div className="ten wide column"><h1>Markings</h1></div>
                    <div className="six wide column">
                        {/* <label htmlFor="hidden-new-file" className="ui inverted green button" style={{ float: "right" }}>
                            Upload
                            <input type="file" id="hidden-new-file" accept="application/pdf" style={{ display: "none" }} onChange={this.onFileHandler} required multiple></input>
                        </label> */}
                        <button className="ui inverted green button" style={{ float: "right" }} onClick={() => this.addNewMarking()}>New Marking</button>
                    </div>
                </div>
                <table className="ui selectable inverted table" style={{ textAlign: "center" }}>
                    <thead>
                        <tr><th>Student</th>
                            <th>Updated By</th>
                            <th>Updated On</th>
                            <th>Grade</th>
                            <th>Action</th>
                        </tr></thead>
                    <tbody>
                        {tableData}
                    </tbody>
                </table>
                {/* {assignmentData} */}
                <Modal
                    open={openUploadModal}
                    onOpen={this.handleUploadModal}
                    onClose={this.handleUploadModal}
                    size='small'
                    style={{ maxHeight: "300px", verticalAlign: "center", margin: "auto" }}
                >
                    <Modal.Header>Upload Submission</Modal.Header>
                    <Modal.Content>
                        {/* <label htmlFor="hidden-new-file" className="ui green button">
                            <i className="cloud upload icon" style={{ margin: 0 }}></i>
                            
                        </label> */}
                        <input type="file" accept="application/pdf" onChange={this.onFileHandler}></input>
                    </Modal.Content>
                </Modal>
            </div>
        );
    }
}

export { Marking };