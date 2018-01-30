import * as types from '../../constants/actionTypes';
import initialState from '../../reducers/initialState';
export function teamReducers(state = initialState, action) {
    switch (action.type) {
        case types.RETRIEVE_CONTACTS_SUCCESS:
            return {
                ...state,
                contacts: (state.contacts || []).filter(contact => (action.contacts || []).map(c => c.email).indexOf(contact.email) < 0).concat(action.contacts)
            };
        case types.RETRIEVE_CONTACTS_FAIL:
            return {
                ...state,
                contacts: []
            };
        case types.SEARCH_TEAMS_SUCCESS:
            return {
                ...state,
                teamSearchResults: action.teams
            };
        case types.SELECT_TEAM:
            return {
                ...state,
                selectedTeam: action.team
            };
        case types.FETCH_TEAMS_SUCCESS:
            return {
                ...state,
                teams: action.teams
            };
        default:
            return state;
    }
}
