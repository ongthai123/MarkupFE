import React from 'react';

import { userService, authenticationService } from '@/_services';

class Canvas extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentUser: authenticationService.currentUserValue,
            userFromApi: null
        };
    }

    componentDidMount() {
        const { currentUser } = this.state;
        userService.getById(currentUser.id).then(userFromApi => this.setState({ userFromApi }));

        const canvas = this.refs.canvas
        const ctx = canvas.getContext("2d")
        const img = new Image; //this.refs.image

        img.onload = function() {
            ctx.drawImage(img, 20,20);
            alert('the image is drawn');
        }
        // img.src = URL.createObjectURL(e.target.files[0]);
    }

    render() {
        const { currentUser, userFromApi } = this.state;
        return (
            <div>
                <h1>Canvas</h1>
                <div>
                    <canvas ref="canvas" width={640} height={425} />
                    {/* <img ref="image" src="C:\Users\Thai\Desktop\xmas.jpg" className="hidden" /> */}
                </div>
            </div>
        );
    }
}

export { Canvas };