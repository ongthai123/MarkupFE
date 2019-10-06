import React from 'react';
import { Router, Route, Link } from 'react-router-dom';

import config from 'config';
import { userService, authenticationService } from '@/_services';
import { authHeader, handleResponse } from '@/_helpers';

class Assignment extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentUser: authenticationService.currentUserValue,
            userFromApi: null,
            assignments: null,
            files: [],
            openPreviewModal: false,
            apiUrl: `${config.apiUrl}/api/marking/`
        };
    }

    componentDidMount() {
        const { currentUser } = this.state;
        userService.getById(currentUser.id).then(userFromApi => this.setState({ userFromApi }));

        this.loadData();
    }

    loadData = () => {
        const requestOptions = { method: 'GET', headers: authHeader() };
        fetch(`${config.apiUrl}/api/marking`, requestOptions)
            .then(r => r.json().then(data => ({ status: r.status, body: data })))
            .then(obj => {
                console.log("Assignments: ", obj.body)
                this.setState({
                    assignments: obj.body
                })
            });
    }

    onFileHandler = (e) => {

        let files = [];

        Array.from(e.target.files).forEach(file => {
            files.push(file)
        });
        this.setState({ files }, () => this.saveFiles(files))
    }

    saveFiles = (uploadFiles) => {
        const { currentUser } = this.state;

        console.log(uploadFiles)

        const files = new FormData();

        for (const file of uploadFiles) {
            files.append('files', file);
            files.append('userId', currentUser.id)
        }

        for (var value of files.values()) {
            console.log(value);
        }
        const request = { files: files, userId: currentUser.userId }

        fetch(`${config.apiUrl}/api/marking/create`, {
            headers: authHeader(),
            method: 'POST',
            body: files,
        })
            .then((response => this.loadData()))

    }

    editFile = () => {

    }

    deleteFile = (assignment) => {
        // console.log(assignment)

        const id = assignment.id;

        console.log(id)
        const formData = new FormData();
        formData.append('Id', id)

        for (var value of formData.entries()) {
            console.log(value);
        }
        fetch(`${config.apiUrl}/api/marking/delete`, {
            headers: authHeader(),
            method: 'POST',
            body: formData,
        })
        .then((response => this.loadData()))
    }

    assignModerator = () => {

    }

    previewFile = (assignment) => {
        fetch(`${config.apiUrl}/api/marking/${assignment.id}`, {
            headers: authHeader(),
            method: 'GET',
        })
            .then(r => {
                console.log("Assignments: ", r)
            });
        this.setState({
            apiUrl: `${config.apiUrl}/api/marking/` + assignment.id
        })
    }

    render() {
        const { currentUser, userFromApi, assignments, files } = this.state;

        let tableData = null;
        if (assignments != null) {
            tableData = assignments.map(assignment =>
                <tr key={assignment.id}>
                    <td data-label="Lecturer">{assignment.lecturerName}</td>
                    <td data-label="Moderator">{assignment.moderatorName}</td>
                    <td data-label="Created On">{assignment.createdOn}</td>
                    {/* <td data-label="Updated On">{assignment.updatedOn}</td> */}
                    <td data-label="Grade">{assignment.grade ? assignment.grade : 'Unmarked'}</td>
                    <td>
                        <button className="ui green button"><i className="bookmark icon" style={{ margin: 0 }}></i></button>
                        <a href={this.state.apiUrl} onClick={() => { this.previewFile(assignment) }} target="_blank"><button className="ui primary button"><i className="eye icon" style={{ margin: 0 }}></i></button></a>
                        <Link to={"/test/" + assignment.id} ><button className="ui yellow button"><i className="edit icon" style={{ margin: 0 }}></i></button></Link>
                        <button className="ui red button" onClick={() => { this.deleteFile(assignment) }}><i className="trash alternate icon" style={{ margin: 0 }}></i></button>
                    </td>
                </tr>
            )
        }

        return (
            <div>
                <div className="ui grid">
                    <div className="ten wide column"><h1>Assignment</h1></div>
                    <div className="six wide column">
                        <label htmlFor="hidden-new-file" className="ui inverted green button" style={{ float: "right" }}>
                            Upload
                            <input type="file" id="hidden-new-file" accept="application/pdf" style={{ display: "none" }} onChange={this.onFileHandler} required multiple></input>
                        </label>
                    </div>
                </div>
                <table className="ui selectable inverted table" style={{ textAlign: "center" }}>
                    <thead>
                        <tr><th>Lecturer</th>
                            <th>Moderator</th>
                            <th>Created On</th>
                            <th>Grade</th>
                            <th>Action</th>
                        </tr></thead>
                    <tbody>
                        {tableData}
                    </tbody>
                </table>
            </div>
        );
    }
}

export { Assignment };