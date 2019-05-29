import React from "react";
import { Link } from "react-router-dom";

import Common from "../../../util/Common";
import MainRepository from "../../../redux/MainRepository";
import { ThreeBounce } from "better-react-spinkit";
import Tooltip from "@material-ui/core/Tooltip";

class AudienceTrackingList extends React.Component {
  state = {
    resultList: [],
    filterList: null,
    loading: false,
    tableOptionFlag: false,
    includeFlag: true
  };

  constructor() {
    super();
    this.handleKeyUp = this.keyUpHandler.bind(this);
  }


  // 검색 박스 keyup 관리
  keyUpHandler = () => {
    let searchValue = document.getElementById("searchInput").value;
    let filteredResult = null;
    if (searchValue) {
      let result = this.state.resultList;
      filteredResult = result.filter(el => {
        if (el.user) return el.user.e.indexOf(searchValue) !== -1;
        return false;
      });
    }
    this.setState({ filterList: filteredResult });
  };


  // 트랙킹 리스트 GET
  getTrackingList = () => {
    const { location, getShowAnonymous, getIncludeOnlyOnePage } = this.props;
    const documentData = location.state.documentData;
    const params = {
      documentId: documentData.documentId,
      anonymous: getShowAnonymous ? "true" : "false",
      include: getIncludeOnlyOnePage ? "true" : "false"
    };

    this.setState({ loading: true, resultList: [] }, () => {
      MainRepository.Tracking.getTrackingList(params, (res) => {
        let resData = res;
        this.setState({ loading: false });
        this.setState({ resultList: resData.resultList ? resData.resultList : [] });
      });
    });
  };

  // 리워드 정보 표시
  showRewardInfo = (id) => {
    if (document.getElementById(id)) document.getElementById(id).style.display = "block";
  };

  // 리워드 정보 숨김
  hideRewardInfo = (id) => {
    if (document.getElementById(id)) document.getElementById(id).style.display = "none";
  };

  // 파일 export
  handleExport = () => {
    const { location } = this.props;
    const documentData = location.state.documentData;
    MainRepository.Tracking.getTrackingExport(documentData.documentId, rst => {
      const a = document.createElement("a");
      a.style.display = "none";
      document.body.appendChild(a);

      a.href = rst.downloadUrl;

      a.setAttribute("download", "tracking_" + documentData.seoTitle + ".xls");
      a.click();

      window.URL.revokeObjectURL(a.href);
      document.body.removeChild(a);
    });
  };

  // 옵션 버튼 관리
  handleOptionButtonClickEvent = () => {
    this.setState({ tableOptionFlag: !this.state.tableOptionFlag });
  };

  // 옵션 버튼 숨김
  handleHideOption = () => {
    const { setShowAnonymous, getShowAnonymous } = this.props;
    setShowAnonymous(!getShowAnonymous, () => {
      this.getTrackingList();
    });
  };

  // 1 페이지 보기/숨김 옵션 관리
  handleOnePageOption = () => {
    const { setIncludeOnlyOnePage, getIncludeOnlyOnePage } = this.props;
    setIncludeOnlyOnePage(!getIncludeOnlyOnePage, () => {
      this.getTrackingList();
    });
  };

  // 특정 링크 클릭 이벤트 관리
  handleLinkClickEvent = (e) => {
    const { location, match } = this.props;
    const documentData = location.state.documentData;
    const documentText = location.state.documentText;
    let _cid = e.target.parentElement.dataset.cid;
    let _email = e.target.parentElement.dataset.email;
    let _time = e.target.parentElement.dataset.time;

    this.props.history.push({
      pathname: "/trackingDetail/" + match.params.identification + "/" + match.params.seoTitle,
      state: { document: documentData, documentText: documentText, cid: _cid, email: _email, time: _time }
    });
  };

  componentWillMount() {
    this.getTrackingList();
  }

  render() {
    const { location, match, getShowAnonymous, getIncludeOnlyOnePage, getCreatorDailyRewardPool } = this.props;
    const { loading, tableOptionFlag } = this.state;

    const rst = !this.state.filterList ? this.state.resultList : this.state.filterList;
    const documentData = location.state.documentData;
    const totalViewCountInfo = location.state.totalViewCountInfo;
    let addr = Common.getThumbnail(documentData.documentId, 320, 1);
    let reward = Common.toEther(Common.getAuthorNDaysReward(documentData, getCreatorDailyRewardPool, totalViewCountInfo, 7));
    let vote = Common.toEther(documentData.latestVoteAmount);
    let view = documentData.latestPageview || 0;

    return (

      <div className="row">
        <div className="u__center">

          <div className="row">
            <div className="col-sm-3 col-md-3 col-thumb p-0 p-sm-3 mr-0 mr-sm-2">
              <Link to={"/" + match.params.identification + "/" + documentData.seoTitle}>
                <div className="tab-thumbnail">
                  <img src={addr}
                       alt={documentData.title ? documentData.title : documentData.documentName}
                       className="img-fluid"/>
                </div>
              </Link>
            </div>

            <div className="col-sm-9 col-md-9 col-details_info p-sm-3 ">
              <dl className="details_info">
                <Link to={"/" + match.params.identification + "/" + documentData.seoTitle} className="info_title mb-2">
                  {documentData.title}
                </Link>

                <div className="option-menu-btn d-sm-inline-block d-none"
                     onClick={this.handleOptionButtonClickEvent.bind(this)}>
                  <i className="material-icons">more_vert</i>
                  <div className={"option-table" + (tableOptionFlag ? "" : " d-none")}>
                    <div title={getShowAnonymous ? "Hide Anonymous" : "Show Anonymous"}
                         onClick={(e) => this.handleHideOption(e)}>
                      {getShowAnonymous ? "Hide Anonymous" : "Show Anonymous"}
                    </div>
                    <div title={getIncludeOnlyOnePage ? "Exclude only one page" : "Include only one page"}
                         onClick={(e) => this.handleOnePageOption(e)}>
                      {getIncludeOnlyOnePage ? "Exclude only one page" : "Include only one page"}
                    </div>
                  </div>
                </div>


                <div className="col-view tracking-item mb-1  mt-1 position-relative">
                 <span className="info-detail-reward mr-2"
                       onMouseOver={() => this.showRewardInfo(documentData.seoTitle + "reward")}
                       onMouseOut={() => this.hideRewardInfo(documentData.seoTitle + "reward")}>
                    ${Common.deckToDollar(reward)}
                   <i className="material-icons">arrow_drop_down</i>
                  </span>

                  {reward > 0 &&
                  <div className="info-detail-reward-info" id={documentData.seoTitle + "reward"}>
                    Creator payout <span className="font-weight-bold">{(!reward ? 0 : reward)} DECK</span> in 7 days
                  </div>
                  }

                  <span className="info-detail-view mr-3">{view}</span>
                  <span className="info-detail-vote mr-4">{Common.deckStr(vote)}</span>
                  <span className="ml-4 info_date"> {Common.timestampToDate(documentData.created)}</span>
                </div>
                {location &&
                <Tooltip title="Export tracking data as Excel file." placement="bottom">
                  <div className="viewer-btn" onClick={() => this.handleExport()}>
                    <i className="material-icons">save</i>
                    Export
                  </div>
                </Tooltip>
                }
              </dl>
            </div>
          </div>


          <div className="tracking_inner">
            <div className="col-sm-12 col-md-12 row tracking_top">
              <div className="pl-0 tracking-list-title d-none d-sm-inline-block col-5 col-md-7 col-lg-9">Visitors</div>


              <div className="option-menu-btn d-inline-block d-sm-none"
                   onClick={this.handleOptionButtonClickEvent.bind(this)}>
                <i className="material-icons">more_vert</i>
                <div className={"option-table" + (tableOptionFlag ? "" : " d-none")}>
                  <div title={getShowAnonymous ? "Hide Anonymous" : "Show Anonymous"}
                       onClick={(e) => this.handleHideOption(e)}>
                    {getShowAnonymous ? "Hide Anonymous" : "Show Anonymous"}
                  </div>
                  <div title={getIncludeOnlyOnePage ? "Exclude only one page" : "Include only one page"}
                       onClick={(e) => this.handleOnePageOption(e)}>
                    {getIncludeOnlyOnePage ? "Exclude only one page" : "Include only one page"}
                  </div>
                </div>
              </div>


              <div className="tags_menu_search_container p-0 col-7 col-md-5 col-lg-3">
                <input id="searchInput" type="text" autoComplete="off" placeholder="Name Search . . ."
                       onKeyUp={this.handleKeyUp}/>
                <div className="search-btn">
                  <i className="material-icons">search</i>
                </div>
              </div>

              <div className="tracking_table">
                <table>
                  <tbody>
                  <tr>
                    <th className="col1">Name</th>
                    <th className="col2">Views</th>
                    <th className="col3">Last Viewed</th>
                  </tr>

                  {rst.length > 0 && rst.map((result, idx) => (
                    <tr key={idx} onClick={this.handleLinkClickEvent.bind(this)} data-cid={result.cid}
                        data-email={result.user ? result.user.e : "Anonymous"} data-time={result.viewTimestamp}
                        className="c-pointer">
                      <td className="col1">
                        {result.user ? result.user.e : "Anonymous"}
                      </td>
                      <td className="col2">{result.count}</td>
                      <td
                        className="col3">{Common.dateAgo(result.viewTimestamp) === 0 ? "Today" : Common.dateAgo(result.viewTimestamp) + " days ago"} </td>
                    </tr>
                  ))}
                  </tbody>
                </table>

                {loading && <div className="spinner"><ThreeBounce name="ball-pulse-sync"/></div>}
                {!loading && rst.length === 0 && <div className="no-data">No data</div>}

              </div>
            </div>
          </div>
        </div>
      </div>

    );
  }
}

export default AudienceTrackingList;