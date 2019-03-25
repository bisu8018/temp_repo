import React from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import "react-tabs/style/react-tabs.css";
import Spinner from "react-spinkit";

import MainRepository from "../../../../../redux/MainRepository";
import CuratorTabItem from "./CuratorTabItem";


class CuratorUploadTab extends React.Component {
  state = {
    resultList: [],
    pageNo: null,
    isEndPage: false,
    moreDataFlag: false
  };

  fetchMoreData = () => {
    const { pageNo } = this.state;
    if(this.state.moreDataFlag) {
      this.fetchDocuments({
        pageNo: pageNo + 1
      });
    }
  };

  fetchDocuments = (params) => {
    const { accountId } = this.props;
    const pageNo = (!params || isNaN(params.pageNo)) ? 1 : Number(params.pageNo);
    MainRepository.Document.getDocumentList({ accountId: accountId, pageNo: pageNo }, (res) => {
      if (res && res.resultList) {
        if (this.state.resultList) {
          this.setState({
            resultList: this.state.resultList.concat(res.resultList),
            pageNo: res.pageNo,
          });
        } else {
          this.setState({
            resultList: res.resultList,
            pageNo: res.pageNo,
          });
        }

        this.setState({ moreDataFlag: true });

        if (res.count === 0 || res.resultList.length < 10) {
          this.setState({ isEndPage: true });
        }
      }
    });
  };

  componentWillMount() {
    this.fetchDocuments();
  }


  render() {
    const { drizzleApis } = this.props;
    return (

      <div>
        <div className="document-total-num">
          Total documents : <span>{this.state.resultList.length}</span>
        </div>
        <InfiniteScroll
          dataLength={this.state.resultList.length}
          next={this.fetchMoreData}
          hasMore={!this.state.isEndPage}
          loader={<div className="spinner"><Spinner name="ball-pulse-sync"/></div>}>


          {this.state.resultList.map((result, idx) => (
            <CuratorTabItem document={result}
                            key={idx}
                            drizzleApis={drizzleApis}/>
          ))}
        </InfiniteScroll>
      </div>

    );
  }
}

export default CuratorUploadTab;
