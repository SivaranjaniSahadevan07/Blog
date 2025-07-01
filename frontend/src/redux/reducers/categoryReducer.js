import {
    GET_ALL_CATEGORIES,
    GET_SINGLE_CATEGORY,
    CREATE_CATEGORY,
    DELETE_CATEGORY,
    CATEGORY_ERROR,
} from '../../constants/actionTypes';

const initialState = {
    categories: [],
    category: null, // For storing a single category
    error: null,
};

const categoryReducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_ALL_CATEGORIES:
            return {
                ...state,
                categories: action.payload,
                error: null,
            };
        case GET_SINGLE_CATEGORY:
            return {
                ...state,
                category: action.payload, // Store the single category details
                error: null,
            };
        case CREATE_CATEGORY:
            return {
                ...state,
                categories: [...state.categories, action.payload], // Add the new category to the list
                error: null,
            };
        case DELETE_CATEGORY:
            return {
                ...state,
                categories: state.categories.filter((category) => category._id !== action.payload),
                error: null,
            };
        case CATEGORY_ERROR:
            return {
                ...state,
                error: action.payload,
            };
        default:
            return state;
    }
};

export default categoryReducer;