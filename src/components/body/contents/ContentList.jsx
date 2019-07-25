import React, { Component } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { ThreeBounce } from "better-react-spinkit";
import { Helmet } from "react-helmet";
import { psString } from "../../../config/localization";
import log from "../../../config/log";
import MainRepository from "../../../redux/MainRepository";
import Common from "../../../config/common";
import ContentTagsContainer from "../../../container/body/contents/ContentTagsContainer";
import ContentListItemContainer from "../../../container/body/contents/ContentListItemContainer";
import NoDataIcon from "../../common/NoDataIcon";


class ContentList extends Component {
  state = {
    resultList: [],
    pageNo: 1,
    isEndPage: false,
    tag: null,
    totalViewCountInfo: null,
    path: null,
    loading: false,
    tagSearchFlag: false
  };


  constructor(props) {
    super(props);
    this.handleCategories = this.handleCategories.bind(this);
  }


  // 초기화
  init = () => {
    log.ContentList.init();
    this.setFetch();
    this.setTagList();
  };


  // 무한 스크롤 두번째 데이터 GET
  fetchMoreData = () => {
    const { pageNo, tag, path, resultList } = this.state;

    let _pageNo = (resultList.length === 0 ? 1 : pageNo + 1);

    this.fetchDocuments({
      pageNo: _pageNo,
      tag: tag,
      path: path
    });
  };


  // document 데이터 fetch
  fetchDocuments = (args) => {
    const { path, resultList, tagSearchFlag } = this.state;
    const params = {
      pageNo: args.pageNo,
      tag: args.tag,
      path: args.path ? args.path : path
    };
    this.setState({ loading: true });
    MainRepository.Document.getDocumentList(params).then(res => {
      this.setState({ loading: false });
      log.ContentList.fetchDocuments();
      const _resultList = res.resultList ? res.resultList : [];
      const pageNo = res.pageNo;

      if (_resultList.length > 0) {
        if (resultList.length > 0 && !tagSearchFlag) this.setState({
          resultList: resultList.concat(_resultList),
          pageNo: pageNo
        });
        else this.setState({ resultList: _resultList, pageNo: pageNo, tagSearchFlag: false });
      } else this.setState({ isEndPage: true });


      if (res && res.totalViewCountInfo && !this.state.totalViewCountInfo) {
        this.setState({ totalViewCountInfo: res.totalViewCountInfo });
      }
    }, err => {
      this.setState({ loading: false });
      log.ContentList.fetchDocuments(err);
      this.setTimeout = setTimeout(() => {
        this.fetchDocuments(args);
        clearTimeout(this.setTimeout);
      }, 8000);
    });
  };


  // fetch 진행
  setFetch = () => {
    let path = Common.getPath(), tag = Common.getTag();

    return this.setState({
      resultList: [],
      pageNo: 1,
      isEndPage: false,
      tag: tag,
      path: path,
      tagSearchFlag: true
    }, () => {
      this.fetchDocuments({
        tag: tag,
        path: path
      });
    });
  };


  //태그 리스트 GET
  setTagList = () => {
    const { setTagList, getTagList } = this.props;

    let path = Common.getPath();
    if (getTagList.path !== path) MainRepository.Document.getTagList(path).then(result => setTagList(result.resultList)).then(log.ContentList.setTagList());

  };


  // 카테고리 관리
  handleCategories = () => {
    let path = Common.getPath(), sec_path = Common.getTag();
    this.props.history.push("/" + path + "/" + sec_path);
  };


  // 업로드 버튼 관리
  handleUploadBtn = () => {
    document.getElementById("uploadBtn").click();
  };


  componentDidUpdate = () => {
    let pathArr = window.location.pathname.split("/");
    if (pathArr.length > 2 && decodeURI(pathArr[2]) !== this.state.tag) this.setFetch();
  };


  componentWillMount() {
    this.init();
  }


  render() {
    const { match, isEndPage, getIsMobile } = this.props;
    const { resultList, totalViewCountInfo } = this.state;

    return (
      <div className="row container">
        <Helmet>
          <title>{psString("helmet-title-" + Common.getPath()) + " | Polaris Share"}</title>
        </Helmet>

        <ContentTagsContainer path={match.path} url={match.url} {...this.props}/>

        <section className="col-sm-12 col-lg-9 u__center-container">

          <div className="d-block d-sm-none content-list-path">{Common.getPath()}</div>

          <div className="mt-0 mt-sm-4 pt-0 pt-sm-2 u__center content-list-wrapper">

            <InfiniteScroll
              className={getIsMobile ? "overflow-initial" : ""}
              dataLength={resultList.length}
              next={this.fetchMoreData}
              hasMore={!isEndPage}
            >
              {resultList.length > 0 && resultList.map((result) => (
                <ContentListItemContainer key={result.documentId + result.accountId} result={result}
                                          totalViewCountInfo={totalViewCountInfo}/>
              ))}
            </InfiniteScroll>
            {this.state.loading &&
            <div className="spinner"><ThreeBounce color="#3681fe" name="ball-pulse-sync"/></div>
            }
            {!this.state.loading && ((resultList && resultList.length === 0) || !resultList) &&
            <NoDataIcon className="no-data">No data</NoDataIcon>
            }
          </div>
        </section>

      </div>
    );
  }
}

export default ContentList;
