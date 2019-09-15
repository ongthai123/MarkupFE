import React from 'react';
import { Button, Header, Image, Modal, Icon } from 'semantic-ui-react'

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
            openPreviewModal: false
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
        formData.append('Id', "ABC")

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
            // headers: {
            //     'Content-Type': 'application/json',
            //     'Accept': 'application/json'
            // },
            headers: authHeader(),
            method: 'GET',
            // mode: 'no-cors'
        })
            .then(r => {
                console.log("Assignments: ", r.json())

                this.openPreviewModal();
            });
    }

    openPreviewModal = () => {
        this.setState({
            openPreviewModal: !this.state.openPreviewModal
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
                    <td data-label="Grade">{assignment.grade}</td>
                    <td>
                        <button className="ui green button"><i className="bookmark icon" style={{ margin: 0 }}></i></button>
                        <button className="ui primary button" onClick={() => { this.previewFile(assignment) }}><i className="eye icon" style={{ margin: 0 }}></i></button>
                        <button className="ui yellow button"><i className="edit icon" style={{ margin: 0 }}></i></button>
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
                            <input type="file" id="hidden-new-file" style={{ display: "none" }} onChange={this.onFileHandler} required multiple></input>
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

                <Modal open={this.state.openPreviewModal} onClose={this.openPreviewModal}>
                    <Modal.Header>Profile Picture</Modal.Header>
                    <Modal.Content image>
                        <Image wrapped size='medium' src='https://react.semantic-ui.com/images/wireframe/image.png' />
                        <Modal.Description>
                            <Header>Modal Header</Header>
                            <p>
                                This is an example of expanded content that will cause the modal's
                                dimmer to scroll
                </p>
                            <Image src='https://react.semantic-ui.com/images/wireframe/paragraph.png' />
                            <Image src='https://react.semantic-ui.com/images/wireframe/paragraph.png' />
                            <Image src='https://react.semantic-ui.com/images/wireframe/paragraph.png' />
                            <Image src='https://react.semantic-ui.com/images/wireframe/paragraph.png' />
                        </Modal.Description>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button primary>
                            Proceed <Icon name='right chevron' />
                        </Button>
                    </Modal.Actions>
                </Modal>
            </div>
        );
    }
}

export { Assignment };