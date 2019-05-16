import React, { Component } from "react";
import { Route, Router, Switch  } from "react-router-dom";
import history from "apis/history/history";

import RouterList from "../util/RouterList";
import MainRepository from "../redux/MainRepository";
import GuideModal from "./modal/GuideModal";
import CookiePolicyModal from "./modal/CookiePolicyModal";
import UserInfo from "../redux/model/UserInfo";
import HeaderContainer from "../container/header/HeaderContainer";
import Common from "../util/Common";
import AlertContainer from "../container/common/AlertContainer";

import "react-tabs/style/react-tabs.css";
import "react-tagsinput/react-tagsinput.css";
import "react-responsive-carousel/lib/styles/carousel.min.css";

class Main extends Component {
  state = {
    init: false,
    myInfo: new UserInfo()
  };

  //초기화
  init = () => {
    MainRepository.init(() => {
      this.setTagList();  //태그 리스트 GET
      this.setMyInfo();   // 내 정보 GET
      this.setIsMobile();   // 모바일 유무 GET
      this.setAuthorDailyRewardPool();   // 크리에이터 리워드풀 GET
      this.setCuratorDailyRewardPool();   // 큐레이터 리워드풀 GET
    });
  };

  //태그 리스트 GET
  setTagList = () => {
    const { setTagList } = this.props;

    MainRepository.Document.getTagList(result => {
      setTagList(result.resultList);
    });
  };

  // 내 정보 GET
  setMyInfo = () => {
    const { getMyInfo, setMyInfo } = this.props;

    if (MainRepository.Account.isAuthenticated() && getMyInfo.email.length === 0) {
      let myInfo = MainRepository.Account.getMyInfo();
      MainRepository.Account.getAccountInfo(myInfo.sub, result => {
        setMyInfo(result);
        this.setState({ init: true, myInfo: result });
      });
    }
  };

  // 모바일 유무 GET
  setIsMobile = () => {
    const { setIsMobile } = this.props;

    if (document.documentElement.clientWidth < 576) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }
  };

  // 크리에이터 리워드풀 GET
  setAuthorDailyRewardPool = () => {
    const { setAuthorDailyRewardPool } = this.props;
    setAuthorDailyRewardPool(115068493148000000000000);    // web3 speed issue, 리워드풀 하드코딩
  };

  // 큐레이터 리워드풀 GET
  setCuratorDailyRewardPool = () => {
    const { setCuratorDailyRewardPool } = this.props;
    setCuratorDailyRewardPool(49315068492000000000000);   // web3 speed issue, 리워드풀 하드코딩
  };

  componentWillMount() {
    this.init();
    history.listen(MainRepository.Analytics.sendPageView);
  }

  /*  componentDidCatch(error, errorInfo) {
      // [2019-04-10]   센트리 에러 체킹
      // https://docs.sentry.io/platforms/javascript/react/?_ga=2.47401252.280930552.1554857590-1128220521.1554857590
      if (process.env.NODE_ENV === "production") {
        this.setState({ error });
        console.error("errorInfo", error);
        Sentry.withScope(scope => {
          scope.setExtras(errorInfo);
          const eventId = Sentry.captureException(error);
          this.setState({ eventId });
        });
      }
    }*/

  render() {
    const { getIsMobile, getMyInfo, getAlertCode } = this.props;

    let pathName = window.location.pathname.split("/")[1];
    let guidedValue = Common.getCookie("gv");
    let pathNameFlag =
      pathName === "latest" ||
      pathName === "featured" ||
      pathName === "popular";

    if (MainRepository.Account.isAuthenticated() && getMyInfo.email.length === 0) return <div/>;

    return (

      <Router history={history}>
        <div id="container-wrapper">
          <HeaderContainer/>

          <div id="container" data-parallax="true">
            <div className="container">
              <Switch>
                {RouterList.routes.map((result, idx) => {
                    let flag = false;
                    if (idx === 0) flag = true;
                    return (
                      <Route exact={flag} key={result.name} path={result.path}
                             render={(props) =>
                               <result.component {...props} />}
                      />
                    );
                  }
                )}
              </Switch>
            </div>
          </div>

          { getAlertCode && <AlertContainer code={getAlertCode}/> }

          {pathNameFlag && getIsMobile === false && (!guidedValue || guidedValue === "false") && <GuideModal/>}
          <CookiePolicyModal/>

        </div>
      </Router>

    );
  }
}

export default Main;