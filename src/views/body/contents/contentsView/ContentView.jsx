import React from "react";
import Spinner from 'react-spinkit'
import {Helmet} from "react-helmet";

import withStyles from "@material-ui/core/styles/withStyles";

import * as restapi from 'apis/DocApi';
import Web3Apis from 'apis/Web3Apis';

import ContentViewFullScreen from "./ContentViewFullScreen";
import ContentViewRight from "./ContentViewRight";
import MainRepository from "../../../../redux/MainRepository";

const style = {};

class ContentView extends React.Component {
    state = {
        document: null,
        documentText: null,
        dataKey: null,
        determineAuthorToken: -1,
        featuredList: null,
        approved: -1
    };

    web3Apis = new Web3Apis();

    componentWillMount() {
        if (!this.state.document) {
            const {match} = this.props;
            const documentId = match.params.documentId;
            this.getContentInfo(documentId);

            //console.log(documentId, "byte32", this.web3Apis.asciiToHex(documentId));
        }
    }

    shouldComponentUpdate() {
        this.getApproved();
        return true;
    }

    getContentInfo = (documentId) => {
        MainRepository.Document.getDocument(documentId, (res) => {
            const resData = res;
            //console.log(typeof res.data.featuredList);
            this.setState({document: resData.document, featuredList: resData.featuredList});
        });

        MainRepository.Document.getDocumentText(documentId, (res) => {
            console.log("text ", res);
            console.log(res);
            this.setState({documentText: res.data.text});
        });
    };
    getApproved = () => {
        const {drizzleApis} = this.props;

        if (drizzleApis.isAuthenticated() && this.state.approved < 0) {

            this.web3Apis.getApproved(drizzleApis.getLoggedInAccount()).then((data) => {
                console.log("getApproved", data);
                this.setState({approved: data});
            }).catch((err) => {
                console.log("getApproved Error", err);
            });
        }

    };

    render() {
        const {...rest} = this.props;
        const document = this.state.document;

        if (!document) {
            return (<div className="spinner"><Spinner name="ball-pulse-sync"/></div>);
        }

        return (

            <div className="contentGridView application">

                <Helmet>
                    <meta charSet="utf-8"/>
                    <title>{document.title}</title>
                    <link rel="canonical" href={"http://share.decompany.io/content/view/" + document.documentId}/>
                </Helmet>

                <div className="leftWrap">
                    <ContentViewFullScreen document={document} documentText={this.state.documentText} {...rest}/>
                </div>

                <ContentViewRight document={this.state.document} featuredList={this.state.featuredList} {...rest}/>

            </div>

        );
    }
}

export default withStyles(style)(ContentView);
