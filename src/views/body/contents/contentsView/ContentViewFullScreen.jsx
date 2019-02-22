import React, {Component} from "react";
import Fullscreen from "react-full-screen";
import FileDownload from "js-file-download";
import {Link} from 'react-router-dom';
import Linkify from 'react-linkify';
import Drawer from 'react-drag-drawer'

import withStyles from "@material-ui/core/styles/withStyles";
import {Face} from "@material-ui/icons";

import * as restapi from 'apis/DocApi';
import Button from "components/custom/HeaderButton";
import Badge from "components/badge/Badge";
import DollarWithDeck from "../../profile/DollarWithDeck";
import DeckInShort from "../../profile/DeckInShort";
import ContentViewCarousel from "./ContentViewCarousel";
import VoteOnDocument from "./VoteOnDocument";
import ContentViewRegistBlockchainButton from "./ContentViewRegistBlockchainButton";
import ContentViewComment from "./ContentViewComment";
import ContentStatistics from './ContentStatistics';

const style = {
    pageViewer: {
        position: "relative",
        height: "auto"
    },
    fullViewer: {
        position: "absolute",
        width: "auto",
        height: "100vh",
        display: "none"
    },
    fullscreenBar: {
        textAlign: "right",
        float: "right"
    },
    fullscreenBtn: {
        padding: "5px",
        margin: "5px",
        fontSize: "12px"
    },
    button: {
        boxShadow: "none"
    }
};

class ContentViewFullScreen extends Component {

    state = {
        isFull: false,
        totalPages: 0,
        popupToggle: false
    };

    popupToggle = () => {
        let {popupToggle} = this.state;
        console.log(this.state);
        this.setState({popupToggle: !popupToggle})
    };

    /*
handlePage = (page) => {
  const documentId = this.props.document.documentId;
  if (this.state.totalPages > 0 && !this.state.isFull) {
    this.handleTracking(documentId, page+1);
  }
}


handleFull = (page) => {
  const documentId = this.props.document.documentId;
  if (this.state.totalPages > 0 && this.state.isFull) {

  }
}
*/

    getContentDownload = (accountId, documentId, documentName) => {

        restapi.getContentDownload(accountId, documentId).then((res) => {
            console.log(res);
            /*
     const url = window.URL.createObjectURL(new Blob([response.data]));
     const link = document.createElement('a');
     link.href = url;
     link.setAttribute('download', filename);
     document.body.appendChild(link);
     link.click();
     */
            FileDownload(new Blob([res.data]), documentName);
        }).catch((err) => {
            console.error(err);
        });

    };

    handleDownloadContent = () => {

        if (!this.props.document) {
            console.log("getting document meta infomation!");
            return;
        }
        //console.log(this.props.document);
        const accountId = this.props.document.accountId;
        const documentId = this.props.document.documentId;
        const documentName = this.props.document.documentName;

        this.getContentDownload(accountId, documentId, documentName);
    };

    goFull = () => {
        this.setState({isFull: true});
    };

    render() {

        const { popupToggle } = this.state;
        const {classes, ...rest} = this.props;

        if (this.state.totalPages !== this.props.document.totalPages) {
            this.setState({totalPages: this.props.document.totalPages});
        }

        let page = document.getElementById("page");
        if (page !== null) {
            if (this.state.isFull) {
                page.style.display = "none";
            } else {
                page.style.display = "block";
            }
        }

        let full = document.getElementById("full");
        if (full !== null) {
            if (this.state.isFull) {
                full.style.display = "block";
            } else {
                full.style.display = "none";
            }
        }

        const badgeReward = this.props.drizzleApis.toEther(this.props.document.confirmAuthorReward);
        const badgeVote = this.props.drizzleApis.toEther(this.props.document.confirmVoteAmount);
        const badgeView = this.props.document.totalViewCount ? this.props.document.totalViewCount : 0;

        return (

            <div className="ContentViewFullScreen">

                <Fullscreen enabled={this.state.isFull} onChange={isFull => this.setState({isFull})}>

                    <div id="page" className={classes.pageViewer}>
                        <ContentViewCarousel id="pageCarousel" target={this.props.document} {...rest} tracking={true}/>

                        <div className={classes.fullscreenBar}>
                            <Button className={classes.fullscreenBtn} onClick={this.goFull}>
                                View full screen
                            </Button>
                        </div>

                        <h2 className="tit">
                            {this.props.document.title ? this.props.document.title : ""}
                        </h2>

                        <div className="descript"
                             style={{display: '-webkit-box', textOverflow: 'ellipsis', 'WebkitBoxOrient': 'vertical'}}>
                            {restapi.convertTimestampToString(this.props.document.created)}
                        </div>

                        <div>
                            <div className="oss-widget-interface"/>
                            <VoteOnDocument document={this.props.document} {...rest} />
                            <Button color="rose" size="sm">
                                Share
                            </Button>
                            <Button color="rose" size="sm" onClick={this.handleDownloadContent}>
                                Download
                            </Button>
                            <Button color="rose" size="sm" onClick={this.popupToggle}>
                                Statistics
                            </Button>
                            <Drawer
                                {...this.props}
                                open={popupToggle}
                                onRequestClose={this.popupToggle}>
                                <ContentStatistics document={this.props.document}/>
                            </Drawer>
                            <ContentViewRegistBlockchainButton document={this.props.document} {...rest} />
                        </div>

                        <span>
                           <Badge color="info">
                               View {badgeView}
                           </Badge>
                           <Badge color="success">
                               Reward
                               <DollarWithDeck deck={badgeReward} drizzleApis={this.props.drizzleApis}/>
                           </Badge>
                           <Badge color="success">
                               Vote
                               <DeckInShort deck={badgeVote}/>
                           </Badge>
                            {
                                this.props.document.tags ? this.props.document.tags.map((tag, index) => (
                                    <Badge color="warning" key={index}>{tag}</Badge>
                                )) : ""
                            }
                        </span>

                        <div className="profileImg">
                            <span className="userImg">
                                <Face className={classes.icons}/>
                            </span>
                            <span className="userName">
                                <Button className={classes.button}>
                                    <Link to={"/author/" + this.props.document.accountId}>
                                        {this.props.document.nickname ? this.props.document.nickname : this.props.document.accountId}
                                    </Link>
                                </Button>
                            </span>
                        </div>

                        <div className="proFileDescript">
                            <Linkify properties={{target: "_blank"}}>
                                {this.props.document.desc ? this.props.document.desc : ""}
                            </Linkify>
                        </div>

                        <ContentViewComment/>

                        <div className="documentText">
                            {this.props.documentText ? this.props.documentText : "No Text"}
                        </div>
                    </div>

                    <div id="full" className={classes.fullViewer}>
                        <ContentViewCarousel id="fullCarousel" target={this.props.document} {...rest} />
                    </div>

                </Fullscreen>

            </div>
        );
    }
}

export default withStyles(style)(ContentViewFullScreen);
