import React from "react";
import { ThreeBounce } from 'better-react-spinkit'
import FeaturedList from "../../../common/FeaturedListItem";
import { psString } from "../../../../config/localization";

class ContentViewRight extends React.Component {

  render() {
    const { documentData, featuredList } = this.props;
    if (!documentData) {
      return (<div className="spinner"><ThreeBounce color="#3681fe" name="ball-pulse-sync"/></div>);
    } else {
      return (
        <aside className="u__right col-md-12 col-lg-4 ">
          <div>{psString("see-also-text")}</div>
          <div className="hr mt-2"/>
          {featuredList.length > 0 && featuredList.map((result, idx) => (
            <FeaturedList resultItem={result} key={idx}/>
          ))}
        </aside>
      );
    }


  }
}

export default ContentViewRight;
