import React from 'react';
import { Button, Header, Image, Modal, Pagination } from 'semantic-ui-react'
import { Router, Route, Link } from 'react-router-dom';
import config from 'config';
import { userService, authenticationService } from '@/_services';
import { authHeader, handleResponse, Role } from '@/_helpers';
import moment from 'moment'

class Moderation extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentUser: authenticationService.currentUserValue,
            userFromApi: null,
            assignments: null,
            files: [],
            pageSize: 10,
            length: 0,
            activePage: 1
        };
    }

    componentDidMount() {
        const { currentUser } = this.state;
        userService.getById(currentUser.id).then(userFromApi => this.setState({ userFromApi }));

        this.loadData();
    }

    loadData = () => {
        const { activePage, pageSize } = this.state;

        let formData = new FormData();
        formData.append('activePage', activePage)
        formData.append('pageSize', pageSize)

        const requestOptions = { method: 'POST', headers: authHeader(), body: formData };

        fetch(`${config.apiUrl}/api/submission`, requestOptions)
            .then(r => r.json().then(data => ({ status: r.status, body: data })))
            .then(obj => {
                // console.log("Submission: ", obj.body)
                this.setState({
                    submissions: obj.body.submissions,
                    length: obj.body.length
                })
            });
    }

    onPageChange = (e, data) => {
        this.setState({
            activePage: Math.ceil(data.activePage)
        }, () => this.loadData())
    }

    render() {
        const { currentUser, userFromApi, submissions, files, activePage, length, pageSize } = this.state;

        let tableData = null;
        if (submissions != null) {
            if (currentUser.role == Role.Admin) {
                tableData = submissions.map(submission =>
                    <tr key={submission.submissionId}>
                        <td>{submission.course.title}</td>
                        <td data-label="Lecturer">{submission.lecturer.firstName + " " + submission.lecturer.lastName}</td>
                        <td data-label="Student">{submission.student.firstName + " " + submission.student.lastName}</td>
                        <td data-label="Moderator">{submission.moderator.firstName + " " + submission.moderator.lastName}</td>
                        <td data-label="Updated By">{submission.updatedBy.firstName + " " + submission.updatedBy.lastName}</td>
                        <td data-label="Updated On">{moment.utc(submission.updatedOn).local().format('lll')}</td>
                        <td>
                            <Link to={"/markings/" + submission.submissionId}><button className="ui teal button"><i className="paint brush icon" style={{ margin: 0 }}></i></button></Link>
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
                            <td data-label="Updated On">{moment.utc(submission.updatedOn).local().format('lll')}</td>
                            <td>
                                <Link to={"/markings/" + submission.submissionId}><button className="ui teal button"><i className="paint brush icon" style={{ margin: 0 }}></i></button></Link>
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
                </div>
                <table className="ui selectable inverted table" style={{ textAlign: "center" }}>
                    <thead>
                        <tr>
                            <th>Course</th>
                            <th>Lecturer</th>
                            <th>Student</th>
                            {currentUser.role == Role.Admin ? <th>Moderator</th> : null}
                            <th>Updated By</th>
                            <th>Updated On</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableData}
                    </tbody>
                </table>
                <Pagination defaultActivePage={1} totalPages={(length / pageSize)} onPageChange={this.onPageChange} />
            </div>
        );
    }
}

export { Moderation };