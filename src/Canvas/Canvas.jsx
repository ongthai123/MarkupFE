import React from 'react';
import { Document, Page } from 'react-pdf';
import { userService, authenticationService } from '@/_services';

const options = {
    cMapUrl: 'cmaps/',
    cMapPacked: true,
  };

class Canvas extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentUser: authenticationService.currentUserValue,
            userFromApi: null,
            numPages: null,
            pageNumber: 1,
            file: null
        };
    }

    componentDidMount() {
        const { currentUser } = this.state;
        userService.getById(currentUser.id).then(userFromApi => this.setState({ userFromApi }));
    }

    onFileChange = (event) => {
        this.setState({
          file: event.target.files[0],
        });
      }
    
      onDocumentLoadSuccess = ({ numPages }) => {
        this.setState({ numPages });
      }
    

    render() {
        const { currentUser, userFromApi, file, numPages } = this.state;
        return (
            <div className="Example">
              <header>
                <h1>react-pdf sample page</h1>
              </header>
              <div className="Example__container">
                <div className="Example__container__load">
                  <label htmlFor="file">Load from file:</label>
                  {' '}
                  <input
                    onChange={this.onFileChange}
                    type="file"
                  />
                </div>
                <div className="Example__container__document">
                  <Document
                    file={this.state.file}
                    onLoadSuccess={this.onDocumentLoadSuccess}
                    options={options}
                  >
                    {
                      Array.from(
                        new Array(numPages),
                        (el, index) => (
                          <Page
                            key={`page_${index + 1}`}
                            pageNumber={index + 1}
                          />
                        ),
                      )
                    }
                  </Document>
                </div>
              </div>
            </div>
          );
    }
}

export { Canvas };