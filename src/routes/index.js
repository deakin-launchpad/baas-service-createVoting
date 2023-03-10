import SetCountRoute from "./setCountRoute/setCountRoute.js";
import CreateGovernorRoute from "./setCreateGovernor/createGovernorRoute.js";
import FinalizeVotingRoute from "./setFinalizeVoting/finalizeVotingRoute.js";
import CreateIdeaRoute from "./setCreateIdea/createIdeaRoute.js";

const Routes = [].concat(SetCountRoute, CreateGovernorRoute, FinalizeVotingRoute, CreateIdeaRoute);
export default Routes;
