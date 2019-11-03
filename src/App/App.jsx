import React from 'react';
import { HashRouter, Route, Link } from 'react-router-dom';

import { history, Role } from '@/_helpers';
import { authenticationService } from '@/_services';
import { PrivateRoute } from '@/_components';
import { HomePage } from '@/HomePage';
import { AdminPage } from '@/AdminPage';
import { LoginPage } from '@/LoginPage';
import { Course } from '@/AdminPage';
import { Student } from '@/AdminPage';
import { Assignment } from '@/AdminPage';
import { Marking } from '@/Marking';
import { Moderation } from '@/Moderation';
import { Test } from '@/Test';
import { User } from '@/User';
import { Submission } from '../Submission';

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentUser: null,
            isAdmin: false
        };
    }

    componentDidMount() {
        authenticationService.currentUser.subscribe(x => this.setState({
            currentUser: x,
            isAdmin: x && x.role === Role.Admin
        }));
    }

    logout() {
        authenticationService.logout();
        history.push('/login');
    }

    render() {
        const { currentUser, isAdmin } = this.state;
        // console.log("Current User: ", currentUser)
        return (
            <HashRouter history={history}>
                <div>
                    {currentUser &&
                        <nav className="navbar navbar-expand navbar-dark bg-dark">
                            <div className="navbar-nav">
                                <Link to="/" className="nav-item nav-link">Home</Link>
                                {isAdmin && <Link to="/admin" className="nav-item nav-link">Admin</Link>}
                                {isAdmin && <Link to="/users" className="nav-item nav-link">User</Link>}
                                <Link to="/course" className="nav-item nav-link">Course</Link>
                                <Link to="/moderation" className="nav-item nav-link">Moderation</Link>
                                <a onClick={this.logout} className="nav-item nav-link">Logout</a>
                            </div>
                        </nav>
                    }
                    <div className="jumbotron">
                        <div className="container">
                            <div className="row">
                                <div className="col-md-12">
                                    <PrivateRoute exact path="/" component={HomePage} />
                                    <PrivateRoute path="/admin" roles={[Role.Admin]} component={AdminPage} />
                                    <PrivateRoute exact path="/course" component={Course} />
                                    <PrivateRoute exact path="/students/:id" component={Student} />
                                    <PrivateRoute exact path="/assignments/:id" component={Assignment} />
                                    <PrivateRoute exact path="/submissions/:id" component={Submission} />
                                    <PrivateRoute exact path="/markings/:id" component={Marking} />
                                    <PrivateRoute exact path="/moderation" component={Moderation} />
                                    <PrivateRoute exact path="/test/:id" component={Test} />
                                    <PrivateRoute exact path="/users" component={User}/>
                                    <Route path="/login" component={LoginPage} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </HashRouter>
        );
    }
}

export { App }; 