import React from "react";
import AutoSuggest from "react-autosuggest";
import TagsInput from "react-tagsinput";
import history from "apis/history/history";

import Slide from "@material-ui/core/Slide";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import MainRepository from "../../../redux/MainRepository";
import Tooltip from "@material-ui/core/Tooltip";
import Common from "../../../config/common";
import { psString } from "../../../config/localization";

function Transition(props) {
  return <Slide direction="down" {...props} />;
}

class EditDocumentModal extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      title: "",
      titleError: "",
      tags: [],
      tagError: "",
      useTracking: false,   // 트래킹 사용 유무
      forceTracking: false,   // 트래킹 강제 사용 유무
      allowDownload: false,   // 다운로드 허용
      classicModal: false,    // 모달 종료
      by: false,   //CC License by 사용유무
      nc: false,   //CC License nc 사용유무
      nd: false,   //CC License nd 사용유무
      sa: false,   //CC License sa 사용유무
      moreOptions: true,    // more options show / hide
      username: null,
      desc: ""
    };
  }

  clearForm = () => {
    document.getElementById("docTitle").value = null;
    document.getElementById("docDesc").value = null;
  };

  clearState = () => {
    this.setState({
      title: "",
      titleError: "",
      tags: [],
      tagError: "",
      useTracking: false,   // 트래킹 사용 유무
      forceTracking: false,   // 트래킹 강제 사용 유무
      allowDownload: false,   // 다운로드 허용
      classicModal: false,    // 모달 종료
      by: false,   //CC License by 사용유무
      nc: false,   //CC License nc 사용유무
      nd: false,   //CC License nd 사용유무
      sa: false,   //CC License sa 사용유무
      moreOptions: true,    // more options show / hide
      username: null,
      desc: ""
    });
  };


  // CC 값 GET
  getCcValue = () => {
    const { by, nd, nc, sa } = this.state;

    if (!by) return null;

    if (!nc && !nd && !sa) return "by";
    else if (nc && !nd && !sa) return "by-nc";
    else if (!nc && nd && !sa) return "by-nd";
    else if (!nc && !nd && sa) return "by-sa";
    else if (nc && !nd && sa) return "by-nc-sa";
    else if (nc && nd && !sa) return "by-nc-nd";
  };


  // CC 상세값 GET
  getCcDetailValue = (cc) => {
    if (cc === "by") this.setState({ by: true });
    else if (cc === "by-nc") this.setState({ by: true, nc: true });
    else if (cc === "by-nd") this.setState({ by: true, nd: true });
    else if (cc === "by-sa") this.setState({ by: true, sa: true });
    else if (cc === "by-nc-sa") this.setState({ by: true, nc: true, sa: true });
    else if (cc === "by-nc-nd") this.setState({ by: true, nc: true, nd: true });

  };


  // 확인 버튼 관리
  handleConfirmBtn = () => {
    // input 값 유효성 검사
    if (!this.validateTitle() || !this.validateTag()) {
      return false;
    }
    this.handleConfirm();
  };


  // 확인 관리
  handleConfirm = () => {
    const { documentData } = this.props;
    const { title, desc, tags, useTracking, forceTracking, allowDownload } = this.state;
    const data = {
      documentId: documentData.documentId,
      desc: desc,
      title: title,
      tags: tags,
      useTracking: useTracking,
      forceTracking: !useTracking ? false : forceTracking,
      isDownload: allowDownload,
      cc: this.getCcValue(),
      isPublic: false
    };
    MainRepository.Document.updateDocument(data).then(result => {
      history.push("/" + Common.getPath() + "/" + result.seoTitle);
      this.handleClose();
      document.location.reload();   //임시로 사용, redux 로 교체 검토 필요
    });
  };


  // 모달 오픈 관리
  handleClickOpen = (modal) => {
    const { documentData } = this.props;
    if (!MainRepository.Account.isAuthenticated()) {
      return MainRepository.Account.login();
    } else {
      const x = [];
      x[modal] = true;
      this.setState(x);
    }

    this.getCcDetailValue(documentData.cc);

    let username = MainRepository.Account.getMyInfo().username;
    let email = MainRepository.Account.getMyInfo().email;
    let _username = username ? username : (email ? email : documentData.accountId);
    this.setState({ username: _username });
    this.setState({ title: documentData.title });
    this.setState({ desc: documentData.desc });
    this.setState({ tags: documentData.tags });
    this.setState({ useTracking: documentData.useTracking || false });
    this.setState({ forceTracking: documentData.forceTracking || false });
    this.setState({ allowDownload: documentData.isDownload || false });
  };


  // 종료 관리
  handleClose = (modal) => {
    const x = [];
    x[modal] = false;
    this.setState(x);
    this.clearForm();
    this.clearState();
  };


  // 제목 변경 관리
  handleTitleChange = e => {
    this.setState({ title: e.target.value }, () => {
      this.validateTitle();
    });
  };


  //태그 변경 관리
  handleTagChange = (tags) => {
    this.setState({ tags: tags }, () => {
      this.validateTag();
    });
  };


  // 설명 변경 관리
  handleDescChange = (e) => {
    this.setState({ desc: e.target.value });
  };


  // 유저 트래킹 체크박스
  handleTrackingCheckbox = () => {
    const { useTracking } = this.state;

    let newValue = !useTracking;
    this.setState({
      useTracking: newValue
    }, () => {
      if (!useTracking) {
        this.setState({
          forceTracking: false
        });
      }
    });
  };


  // 강제 트래킹 체크박스
  handleForceTrackingCheckbox = () => {
    const { forceTracking } = this.state;
    let newValue = !forceTracking;
    this.setState({
      forceTracking: newValue
    });
  };


  // 다운로드 허용 체크박스
  handleAllowDownloadCheckbox = () => {
    const { allowDownload } = this.state;
    let newValue = !allowDownload;
    this.setState({
      allowDownload: newValue
    });
  };


  // CC License by 체크박스
  handleCcByCheckbox = () => {
    const { by } = this.state;
    let newValue = !by;
    this.setState({
      by: newValue
    });
  };


  // CC License nc 체크박스
  handleCcNcCheckbox = () => {
    const { nc } = this.state;
    let newValue = !nc;
    this.setState({
      nc: newValue
    });
  };


  // CC License nd 체크박스
  handleCcNdCheckbox = () => {
    const { nd } = this.state;
    let newValue = !nd;
    this.setState({
      nd: newValue
    });
  };


  // CC License nc 체크박스
  handleCcSaCheckbox = () => {
    const { sa } = this.state;
    let newValue = !sa;
    this.setState({
      sa: newValue
    });
  };


  // more 옵션 관리 버튼
  handleMoreOptions = () => {
    const { moreOptions } = this.state;
    let _moreOptions = moreOptions;
    this.setState({ moreOptions: !moreOptions }, () => {
      if (_moreOptions === true) {
        this.setState({
          useTracking: false,
          forceTracking: false,
          allowDownload: false,
          by: false,
          nc: false,
          sa: false,
          nd: false
        });
      }
    });
  };


  //제목 유효성 체크
  validateTitle = () => {
    const { title } = this.state;
    this.setState({
      titleError:
        title.length > 0 ? "" : psString("edit-doc-error-1")
    });
    return title.length > 0;
  };


  //태그 유효성 체크
  validateTag = () => {
    const { tags } = this.state;
    this.setState({
      tagError:
        tags.length > 0 ? "" : psString("edit-doc-error-2")
    });
    return tags.length > 0;
  };


  // 자동완성 및 태그 관련 라이브러리 함수
  autocompleteRenderInput = ({ addTag, ...props }) => {
    let handleOnChange = (e, { newValue, method }) => {
      if (method === "enter") {
        e.preventDefault();
      } else {
        props.onChange(e);
      }
    };

    let tagList = this.props.getTagList;
    let inputValue = (props.value && props.value.trim().toLowerCase()) || "";
    let inputLength = inputValue.length;
    let suggestions = tagList.length > 0 ?
      tagList.filter((tag) => {
        return tag._id.toLowerCase().slice(0, inputLength) === inputValue;
      })
      : [];

    return (
      <AutoSuggest
        ref={props.ref}
        suggestions={suggestions}
        shouldRenderSuggestions={(value) => value && value.trim().length > 0}
        getSuggestionValue={(suggestion) => suggestion}
        renderSuggestion={(suggestion) => <span key={suggestion._id}>{suggestion._id}</span>}
        inputProps={{ ...props, onChange: handleOnChange }}
        onSuggestionSelected={(e, { suggestion }) => {
          addTag(suggestion._id);
        }}
        onSuggestionsClearRequested={() => {
        }}
        onSuggestionsFetchRequested={() => {
        }}
      />
    );
  };

  render() {
    const { classicModal, moreOptions, title, allowDownload, desc, tags, useTracking, forceTracking, titleError, tagError, by, nc, nd, sa } = this.state;
    const { type } = this.props;

    return (
      <span>
        <Tooltip title={psString("tooltip-settings")} placement="bottom">
          <div className="viewer-btn mb-1" onClick={() => this.handleClickOpen("classicModal")}>
            <i className="material-icons">settings</i> {psString("common-modal-settings")}
          </div>
        </Tooltip>
        {type && type === "menu" &&
        <span className="d-inline-block d-sm-none"
              onClick={() => this.handleClickOpen("classicModal")}>{psString("common-modal-upload")}</span>
        }

        <Dialog
          className="modal-width"
          fullWidth={true}
          open={classicModal}
          TransitionComponent={Transition}
          keepMounted
          aria-labelledby="classic-modal-slide-title"
          aria-describedby="classic-modal-slide-description">

              <DialogTitle
                id="classic-modal-slide-title"
                disableTypography>
                <i className="material-icons modal-close-btn" onClick={() => this.handleClose("classicModal")}>close</i>
                <h3>{psString("edit-doc-subj")}</h3>
              </DialogTitle>


              <DialogContent id="classic-modal-slide-description">
                <div className="dialog-subject">{psString("common-modal-title")}</div>
                <input type="text" placeholder={psString("title-placeholder")} id="docTitle"
                       className={"custom-input " + (titleError.length > 0 ? "custom-input-warning" : "")}
                       value={title}
                       onChange={(e) => this.handleTitleChange(e)}/>
                <span>{titleError}</span>

                <div className="dialog-subject mt-3 mb-2">{psString("common-modal-description")}</div>
                <textarea id="docDesc" value={desc} placeholder={psString("description-placeholder")}
                          onChange={(e) => this.handleDescChange(e)} className="custom-textarea"/>

                <div className="dialog-subject mt-3">{psString("common-modal-tag")}</div>
                {tags &&
                <TagsInput id="tags" renderInput={this.autocompleteRenderInput}
                           className={"react-tagsinput " + (tagError.length > 0 ? "tag-input-warning" : "")}
                           value={tags} onChange={this.handleTagChange} validate={false} onlyUnique/>
                }
                <span> {tagError}</span>


            <div className="modal-more-btn-wrapper">
               <div className="modal-more-btn-line"/>
               <div className="modal-more-btn" onClick={() => this.handleMoreOptions()}>
                 {psString("common-modal-more-option")}
                 <img className="reward-arrow"
                      src={require("assets/image/icon/i_arrow_" + (moreOptions ? "down_grey.svg" : "up_grey.png"))}
                      alt="arrow button"/>
               </div>
            </div>

                {moreOptions &&
                <div>
                  <div className="dialog-subject mb-2 mt-3">{psString("common-modal-option")}</div>
                  <div className="row">
                    <div className="col-12 col-sm-6">
                      <input type="checkbox" id="useTrackingCheckboxEdit"
                             onChange={(e) => this.handleTrackingCheckbox(e)}
                             checked={useTracking}/>

                      <label htmlFor="useTrackingCheckboxEdit">
                        <span><i className="material-icons">done</i></span>
                        {psString("doc-option-1")}
                      </label>
                    </div>
                    <div className="col-12 col-sm-6">
                      <input type="checkbox" id="forceTrackingCheckboxEdit"
                             onChange={(e) => this.handleForceTrackingCheckbox(e)}
                             checked={useTracking ? forceTracking : false} disabled={!useTracking}/>
                      <label htmlFor="forceTrackingCheckboxEdit">
                        <span><i className="material-icons">done</i></span>
                        {psString("doc-option-2")}
                      </label>
                    </div>
                    <div className="col-12 col-sm-6">
                      <input type="checkbox" id="allowDownloadEdit" checked={allowDownload}
                             onChange={(e) => this.handleAllowDownloadCheckbox(e)}/>
                      <label htmlFor="allowDownloadEdit">
                        <span><i className="material-icons">done</i></span>
                        {psString("doc-option-3")}
                      </label>
                    </div>
                  </div>


                  <div className="dialog-subject mb-2 mt-3">{psString("edit-cc-license")}</div>
                  <div className="row">
                    <div className="col-12 col-sm-6">
                      <input type="checkbox" id="ccByCheckboxEdit" onChange={(e) => this.handleCcByCheckbox(e)}
                             checked={by}/>
                      <label htmlFor="ccByCheckboxEdit">
                        <span><i className="material-icons">done</i></span>
                        Attribution
                      </label>
                    </div>
                    <div className="col-12 col-sm-6">
                      <input type="checkbox" id="ccNcCheckboxEdit" onChange={(e) => this.handleCcNcCheckbox(e)}
                             checked={nc}/>
                      <label htmlFor="ccNcCheckboxEdit">
                        <span><i className="material-icons">done</i></span>
                        Noncommercial
                      </label>
                    </div>
                    <div className="col-12 col-sm-6">
                      <input type="checkbox" id="ccNdCheckboxEdit" onChange={(e) => this.handleCcNdCheckbox(e)}
                             checked={sa ? false : nd} disabled={sa}/>
                      <label htmlFor="ccNdCheckboxEdit">
                        <span><i className="material-icons">done</i></span>
                        No Derivative Works
                      </label>
                    </div>
                    <div className="col-12 col-sm-6">
                      <input type="checkbox" id="ccSaCheckboxEdit" onChange={(e) => this.handleCcSaCheckbox(e)}
                             checked={nd ? false : sa} disabled={nd}/>
                      <label htmlFor="ccSaCheckboxEdit">
                        <span><i className="material-icons">done</i></span>
                        Share Alike
                      </label>
                    </div>
                  </div>

                </div>
                }

                  </DialogContent>


                  <DialogActions className="modal-footer">
                  <div onClick={() => this.handleClose("classicModal")}
                       className="cancel-btn">{psString("common-modal-cancel")}</div>
                  <div onClick={() => this.handleConfirmBtn()}
                       className="ok-btn">{psString("common-modal-confirm")}</div>
                  </DialogActions>
                  </Dialog>
                  </span>
    );
  }
}

export default EditDocumentModal;
