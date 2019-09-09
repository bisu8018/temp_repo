import { connect } from "react-redux";
import { setAlertCode } from "../../../redux/reducer/main";
import CopyModal from "../../../components/common/modal/CopyModal";

export default connect(
  state => ({}),
  dispatch => ({
    setAlertCode: (alertCode: any) => dispatch(setAlertCode(alertCode)),
  })
)(CopyModal);
