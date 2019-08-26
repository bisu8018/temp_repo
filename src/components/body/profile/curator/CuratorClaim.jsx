import React from "react";
import Common from "../../../../common/common";
import { APP_PROPERTIES } from "../../../../properties/app.properties";
import { psString } from "../../../../config/localization";

class CuratorClaim extends React.Component {
  state = {
    determineReward: null,
    btnText: psString("claim-text") + " $ "
  };


  // 큐레이터 리워드 GET
  getDetermineCuratorReward = () => {
    const { document, getWeb3Apis, getMyInfo } = this.props;
    const { determineReward } = this.state;

    if (document &&  getMyInfo.ethAccount && determineReward === null) {
      getWeb3Apis.getDetermineCuratorReward(document.documentId, getMyInfo.ethAccount).then((data) => {
        this.setState({ determineReward: (data && Common.toDeck(data[0]) > 0 ? Common.toDeck(data[0]) : 0) });
      }).catch(err => console.error(err));
    }
  };


  // 클레임 버튼 클릭 관리
  handelClickClaim = () => {
    const { document, getDrizzle, getMyInfo, setAlertCode } = this.props;
    if (!getMyInfo.ethAccount) {
      this.setState({ msg: psString("claim-msg-1") });
      return;
    }
    if (getMyInfo.ethAccount !== getDrizzle.getLoggedInAccount()) {
      this.setState({ msg: psString("claim-msg-2") });
      return;
    }

    if (document && getDrizzle.isAuthenticated()) {
      this.setState({ btnText: psString("claim-btn-text-2") }, () => {
        getDrizzle.curatorClaimReward(document.documentId, getMyInfo.ethAccount).then((res) => {
          if (res === "success") this.setState({ btnText: psString("claim-btn-text-1") }, () => {
            window.location.reload();
          });
          else this.setState({ btnText: psString("claim-text") + " $ " }, () => {
            setAlertCode(2035);
          });
        });
      });
    }
  };


  componentWillUpdate(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): void {
    this.getDetermineCuratorReward();
  }


  render() {
    const { getDrizzle, userInfo, getMyInfo, getIsMobile } = this.props;
    const { determineReward, btnText } = this.state;
    let myEthAccount = getMyInfo.ethAccount,
      ethAccount = userInfo ? userInfo.ethAccount : "",
      claimReward = Common.deckToDollar(determineReward > 0 ? determineReward.toString() : 0);

    let drizzleAccount = getDrizzle ? getDrizzle.getLoggedInAccount() : "";
    if (myEthAccount !== ethAccount || ethAccount !== drizzleAccount || !getDrizzle.isAuthenticated() || claimReward <= 0 || btnText === "Complete") return <div/>;

    return (
      <div className={"claim-btn " + (btnText === psString("claim-btn-text-2") ? "btn-disabled" : "") + (getIsMobile ? " w-100" : "")}
           onClick={() => this.handelClickClaim()}>
        {btnText} {(btnText === psString("claim-btn-text-2") ? "" : claimReward)}
      </div>
    );
  }
}

export default CuratorClaim;
