import React from 'react';
import { Button, Header, Image, Modal } from 'semantic-ui-react'

import config from 'config';
import { userService, authenticationService } from '@/_services';
import { authHeader, handleResponse } from '@/_helpers';

class Moderation extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentUser: authenticationService.currentUserValue,
            userFromApi: null,
            assignments: null,
            files: []
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
        const {currentUser} = this.state;

        console.log(uploadFiles)

        const files = new FormData();

        for (const file of uploadFiles) {
            files.append('files[]', file, file.name);
        }

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
        console.log(assignment)

        const id = assignment.id;

        fetch(`${config.apiUrl}/api/marking/delete`, {
            headers: authHeader(),
            method: 'DELETE',
            body: id,
        })
        .then((response => this.loadData()))
    }

    assignModerator = () => {

    }

    render() {
        const { currentUser, userFromApi, assignments, files } = this.state;

        let tableData = null;
        if (assignments != null) {
            tableData = assignments.map(assignment =>
                <tr key={assignment.id}>
                    <td data-label="Lecturer">{assignment.lecturerName}</td>
                    <td data-label="Created On">{assignment.createdOn}</td>
                    <td data-label="Updated On">{assignment.updatedOn}</td>
                    <td data-label="Grade">{assignment.grade}</td>
                    <td>
                        <button className="ui yellow button"><i className="edit icon" style={{ margin: 0 }}></i></button>
                    </td>
                </tr>
            )
        }

        return (
            <div>
                <div className="ui grid">
                    <div className="ten wide column"><h1>Moderation</h1></div>
                    <div className="six wide column">
                        <label htmlFor="hidden-new-file" className="ui inverted green button" style={{ float: "right" }}>
                            Upload
                            <input type="file" id="hidden-new-file" style={{ display: "none" }} onChange={this.onFileHandler} required multiple></input>
                        </label>
                    </div>
                </div>
                <table className="ui selectable inverted table" style={{ textAlign: "center" }}>
                    <thead>
                        <tr><th>Lecturer</th>
                            <th>Created On</th>
                            <th>Updated On</th>
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

export { Moderation };