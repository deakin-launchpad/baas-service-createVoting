import SetCountRoute from "./setCountRoute/setCountRoute.js";
import CreateGovernorRoute from "./setCreateGovernor/createGovernorRoute.js";
import FinalizeVotingRoute from "./setFinalizeVoting/finalizeVotingRoute.js";

const Routes = [].concat(SetCountRoute, CreateGovernorRoute, FinalizeVotingRoute);
export default Routes;
