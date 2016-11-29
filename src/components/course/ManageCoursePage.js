import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as courseActions from '../../actions/courseActions';
import CourseForm from './CourseForm';
//import {browserHistory} from 'react-router';
import toastr from 'toastr';
import {loadAuthors} from '../../actions/authorActions';


class ManageCoursePage extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            course: Object.assign({}, this.props.course),
            errors: {},
            saving: false
        };
        this.updateCourseState = this.updateCourseState.bind(this);
        this.saveCourse = this.saveCourse.bind(this);
        const store = this.context.store;
        store.dispatch(loadAuthors());
    }

    //Life Cycle component that tells if the props have changed or react thinks if the props have changed.
    componentWillReceiveProps(nextProps) {
        if(this.props.course.id != nextProps.course.id){
            //Necessary to populate form when existing course is loaded directly.
            this.setState({course: Object.assign({}, nextProps.course)});
        }
    }

    updateCourseState(event) {
        const field = event.target.name;
        let course = this.state.course;
        course[field] = event.target.value;
        return this.setState({course: course});
    }

    saveCourse(event){
        event.preventDefault();
        this.setState({saving: true});
        this.props.actions.saveCourse(this.state.course)
            .then(() => this.redirect())
                .catch(error => {
                    toastr.error(error);
                    this.setState({saving:false})});
    }

    redirect() {
        this.context.router.push('/courses'); //Alternative to browserHistory.push(browserHistory is obsolete now)
        toastr.success('Course Saved');
        this.setState({saving:false});
    }
    //Passing down data via props
    //this has to be bound. No autobinding exists. Here done in constructor or here itself.
    render() {
        return (
            <CourseForm
                allAuthors={this.props.authors}
                onSave={this.saveCourse}
                onChange={this.updateCourseState}
                course={this.state.course}
                errors={this.state.errors}
                saving={this.state.saving}
            />
        );
    }
}

ManageCoursePage.propTypes = {
    course: PropTypes.object.isRequired,
    authors: PropTypes.array.isRequired,
    actions: PropTypes.object.isRequired
};

/*
* Pull in the React Router context so router is available on this.context.router
* Declared after class definition because it is a static property
* */
ManageCoursePage.contextTypes = {
    router : PropTypes.object,
    store: React.PropTypes.object.isRequired
};

function getCourseById(courses, id) {
    const course = courses.filter(course => course.id == id);
    if(course.length) return course[0]; //Since filter returns an array
    return null;
}

/*
* What part of store to expose to component as state
* Subscribes to store updates and returns an object
* */
function mapStateToProps(state, ownProps) {
    const courseId = ownProps.params.id; //from Path
    let course = {id: '', watchHref: '', title: '', authorId: '', length: '', category: ''};
    if(courseId && state.courses.length > 0) {
        course = getCourseById(state.courses, courseId);
    }
    const authorsFormattedForDropdown = state.authors.map(author => {
        return {
            value: author.id,
            text: author.firstName + ' ' + author.lastName
        };
    });

    return {
        course: course,
        authors: authorsFormattedForDropdown
    };
}

/*
* What actions we want to expose to components
* Takes dispatch as parameter
* Returns callback props that you want to pass down
* */
function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(courseActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ManageCoursePage);
/*
* Connect creates container components. Wraps component so its connected to store.
* What parts of store connected to components as props.
* Also the actions we want to expose on props.
* Also prevents unnecessary renders. Only renders when connected part of store changes.
*/