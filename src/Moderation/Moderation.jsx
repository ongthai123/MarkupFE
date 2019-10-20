import React from 'react';
import { Button, Header, Image, Modal } from 'semantic-ui-react'

import config from 'config';
import { userService, authenticationService } from '@/_services';
import { authHeader, handleResponse, Role } from '@/_helpers';

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
        // fetch(`${config.apiUrl}/api/marking`, requestOptions)
        //     .then(r => r.json().then(data => ({ status: r.status, body: data })))
        //     .then(obj => {
        //         console.log("Assignments: ", obj.body)
        //         this.setState({
        //             assignments: obj.body
        //         })
        //     });

        fetch(`${config.apiUrl}/api/submission`, requestOptions)
            .then(r => r.json().then(data => ({ status: r.status, body: data })))
            .then(obj => {
                console.log("Submission: ", obj.body)
                this.setState({
                    submissions: obj.body
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
        const { currentUser, userFromApi, submissions, files } = this.state;

        let tableData = null;
        if (submissions != null) {
            if (currentUser.role == Role.Admin) {
                tableData = submissions.map(submission =>
                    <tr key={submission.submissionId}>
                        <td>{submission.course.title}</td>
                        <td data-label="Lecturer">{submission.lecturer.firstName + " " + submission.lecturer.lastName}</td>
                        <td data-label="Student">{submission.student.firstName + " " + submission.student.lastName}</td>
                        <td data-label="Updated By">{submission.updatedBy.firstName + " " + submission.updatedBy.lastName}</td>
                        <td data-label="Updated On">{submission.updatedOn}</td>
                        {/* <td data-label="Grade">{submission.grade}</td> */}
                        <td>
                            <button className="ui yellow button"><i className="edit icon" style={{ margin: 0 }}></i></button>
                        </td>
                    </tr>
                )
            }
            else {
                let filteredList = [];
                submissions.forEach(element => {
                    if (element.moderatorId == currentUser.id)
                        filteredList.push(element)
                })

                if (filteredList.length > 0) {
                    tableData = filteredList.map(submission =>
                        <tr key={submission.submissionId}>
                            <td>{submission.course.title}</td>
                            <td data-label="Lecturer">{submission.lecturer.firstName + " " + submission.lecturer.lastName}</td>
                            <td data-label="Student">{submission.student.firstName + " " + submission.student.lastName}</td>
                            <td data-label="Updated By">{submission.updatedBy.firstName + " " + submission.updatedBy.lastName}</td>
                            <td data-label="Updated On">{submission.updatedOn}</td>
                            {/* <td data-label="Grade">{submission.grade}</td> */}
                            <td>
                                <button className="ui yellow button"><i className="edit icon" style={{ margin: 0 }}></i></button>
                            </td>
                        </tr>
                    )
                }
            }
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
                        <tr>
                            <th>Course</th>
                            <th>Lecturer</th>
                            <th>Student</th>
                            <th>Updated By</th>
                            <th>Updated On</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableData}
                    </tbody>
                </table>
            </div>
        );
    }
}

export { Moderation };