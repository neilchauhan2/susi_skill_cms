import React from 'react';
import PropTypes from 'prop-types';
import styles from './SkillStyle';
import ISO6391 from 'iso-639-1';
import Cookies from 'universal-cookie';
import * as $ from 'jquery';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import SelectField from 'material-ui/SelectField';
import Checkbox from 'material-ui/Checkbox';
import IconMenu from 'material-ui/IconMenu';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import RaisedButton from 'material-ui/RaisedButton';
import Add from 'material-ui/svg-icons/content/add';
import Person from 'material-ui/svg-icons/social/person';
import ActionViewModule from 'material-ui/svg-icons/action/view-module';
import ActionViewStream from 'material-ui/svg-icons/action/view-stream';
import ChevronRight from 'material-ui/svg-icons/navigation/chevron-right';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import NavigationArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
import NavigationArrowForward from 'material-ui/svg-icons/navigation/arrow-forward';
import NavigationArrowUpward from 'material-ui/svg-icons/navigation/arrow-upward';
import NavigationArrowDownward from 'material-ui/svg-icons/navigation/arrow-downward';
import IconButton from 'material-ui/IconButton';
import SearchBar from 'material-ui-search-bar';
import CircularProgress from 'material-ui/CircularProgress';
import StaticAppBar from '../StaticAppBar/StaticAppBar.react';
import SkillCardList from '../SkillCardList/SkillCardList';
import SkillCardGrid from '../SkillCardGrid/SkillCardGrid';
import SkillCardScrollList from '../SkillCardScrollList/SkillCardScrollList';
import SkillRating from '../SkillRating/SkillRating.js';
import { urls, colors } from '../../utils';
import Footer from '../Footer/Footer.react';
import './custom.css';

const cookies = new Cookies();

export default class BrowseSkill extends React.Component {
  static propTypes = {
    routeType: PropTypes.string,
    routeValue: PropTypes.string,
    routeTitle: PropTypes.string,
    isUserOnline: PropTypes.bool,
    openSnackBar: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      cards: [],
      modelValue: 'general',
      skillURL: null,
      groupValue: 'All',
      languageValue: cookies.get('languages') || ['en'],
      showSkills: '',
      showReviewedSkills: false,
      showStaffPicks: false,
      expertValue: null,
      skills: [],
      listSkills: [],
      groups: [],
      languages: [],
      groupSelect: false,
      languageSelect: false,
      skillsLoaded: false,
      filter: '',
      orderBy: 'ascending',
      searchQuery: '',
      staffPicksSkills: [],
      topRatedSkills: [],
      topUsedSkills: [],
      topFeedbackSkills: [],
      newestSkills: [],
      latestUpdatedSkills: [],
      topGames: [],
      ratingRefine: null,
      timeFilter: null,
      viewType: 'list',
      listOffset: 0,
      listPage: 1,
      entriesPerPage: 10,
      innerWidth: window.innerWidth,
    };

    this.groups = [];
    this.languages = [];
  }

  componentDidMount() {
    this.setState({ skillsLoaded: false });

    document.title = 'SUSI.AI - Browse Skills';
    this.loadLanguages();
    this.loadGroups();

    if (
      this.props.routeType ||
      ['category', 'language'].includes(window.location.href.split('/')[3])
    ) {
      this.loadCards();
    } else {
      this.loadMetricsSkills();
    }
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  updateWindowDimensions = () => {
    this.setState({
      innerWidth: window.innerWidth,
    });
  };

  // FilterChange

  handleFilterChange = (event, index, value) => {
    this.setState({ filter: value, skillsLoaded: false }, () => {
      this.loadCards();
    });
  };

  handleModelChange = (event, index) => {
    this.setState({ groupSelect: false, skillsLoaded: false }, () => {
      this.loadCards();
    });
  };

  handleGroupChange = (event, value) => {
    this.setState({ groupValue: value, skillsLoaded: false }, () => {
      this.loadCards();
    });
  };

  handleLanguageChange = (event, index, values) => {
    cookies.set('languages', values);
    this.setState({ languageValue: values }, () => {
      if (
        this.props.routeType ||
        ['category', 'language'].includes(window.location.href.split('/')[3])
      ) {
        this.loadCards();
      } else {
        this.loadMetricsSkills();
      }
    });
  };

  handleEntriesPerPageChange = (event, index, values) => {
    let { skills, listPage } = this.state;
    const entriesPerPage = values;
    let listOffset = entriesPerPage * (listPage - 1);
    if (listOffset > skills.length - 1) {
      listPage = Math.ceil(skills.length / entriesPerPage);
      listOffset = entriesPerPage * (listPage - 1);
    }

    this.setState({
      entriesPerPage,
      listOffset,
      listPage,
      listSkills: skills.slice(listOffset, listOffset + values),
    });
  };

  handlePageChange = (event, index, value) => {
    if (value !== undefined) {
      const { entriesPerPage, skills } = this.state;
      const listPage = value;
      const listOffset = entriesPerPage * (listPage - 1);
      this.setState({
        listPage,
        listOffset,
        listSkills: skills.slice(listOffset, listOffset + entriesPerPage),
      });
    }
  };

  handleNavigationForward = () => {
    $('html, body').animate({ scrollTop: 0 }, 'fast');
    const { skills, listPage, listOffset, entriesPerPage } = this.state;
    const newListPage = listPage + 1;
    const newListOffset = listOffset + entriesPerPage;
    this.setState({
      listPage: newListPage,
      listOffset: newListOffset,
      listSkills: skills.slice(newListOffset, newListOffset + entriesPerPage),
    });
  };

  handleNavigationBackward = () => {
    $('html, body').animate({ scrollTop: 0 }, 'fast');
    const { listOffset, entriesPerPage, skills } = this.state;
    let newlistOffset = listOffset - entriesPerPage;
    this.setState(prevState => ({
      listPage: prevState.listPage - 1,
      listOffset: prevState.listOffset - prevState.entriesPerPage,
      listSkills: skills.slice(newlistOffset, prevState.listOffset),
    }));
  };

  handleShowSkills = ({ reviewed, staffPicks }) => {
    const { showReviewedSkills, showStaffPicks } = this.state;
    let showSkills;
    if (reviewed !== undefined) {
      showSkills = `&reviewed=${reviewed}`;
      this.setState({ showReviewedSkills: reviewed });
    } else {
      showSkills = `&reviewed=${showReviewedSkills}`;
    }

    if (staffPicks !== undefined) {
      showSkills += `&staff_picks=${staffPicks}`;
      this.setState({ showStaffPicks: staffPicks });
    } else {
      showSkills += `&staff_picks=${showStaffPicks}`;
    }

    this.setState(
      {
        showSkills,
        skillsLoaded: false,
      },
      () => {
        this.loadCards();
      },
    );
  };

  handleViewChange = (event, value) => {
    this.setState({ viewType: value });
  };

  handleArrivalTimeChange = value => {
    if (value) {
      this.setState(
        {
          filter: `creation_date&duration=${value}`,
          timeFilter: value,
          skillsLoaded: false,
        },
        function() {
          this.loadCards();
        },
      );
    } else {
      this.setState(
        {
          filter: 'rating',
          timeFilter: null,
          skillsLoaded: false,
        },
        function() {
          this.loadCards();
        },
      );
    }
  };

  handleSearch = value => {
    this.setState({ searchQuery: value, skillsLoaded: false }, function() {
      this.loadCards();
    });
  };

  createCategoryMenuItem = categoryName => {
    const mobileView = window.innerWidth < 430;
    const linkValue = '/category/' + categoryName;
    if (mobileView) {
      return (
        <MenuItem
          value={categoryName}
          key={categoryName}
          primaryText={categoryName}
          containerElement={<Link to={linkValue} />}
          style={styles.mobileMenuItem}
          rightIcon={<ChevronRight style={{ top: -8 }} />}
        />
      );
    }
    return (
      <MenuItem
        value={categoryName}
        key={categoryName}
        primaryText={categoryName}
        containerElement={<Link to={linkValue} />}
        style={styles.categorySidebarMenuItem}
      />
    );
  };

  loadGroups = () => {
    const { groups } = this.state;
    if (groups.length === 0) {
      this.groups = [];
      $.ajax({
        url: urls.API_URL + '/cms/getGroups.json',
        dataType: 'jsonp',
        jsonp: 'callback',
        crossDomain: true,
        success: data => {
          data = data.groups;
          data.sort();
          this.groups.push(this.createCategoryMenuItem('All'));
          data.forEach(item => {
            this.groups.push(this.createCategoryMenuItem(item));
          });
          this.setState({ groups: this.groups });
        },
        error: e => {
          console.log('Error while fetching groups', e);
        },
      });
    }
  };

  loadLanguages = () => {
    const { groupValue } = this.state;
    let url = urls.API_URL + '/cms/getAllLanguages.json?';
    if (groupValue != null) {
      url += 'group=' + groupValue;
    }
    $.ajax({
      url: url,
      dataType: 'jsonp',
      jsonp: 'callback',
      crossDomain: true,
      success: data => {
        data = data.languagesArray;
        if (data) {
          data.sort();
          this.languages = [];
          data.forEach(item => {
            if (item.length === 2 && item !== 'xx') {
              this.languages.push(item);
            }
          });
          this.setState({ languages: data });
        }
      },
      error: e => {
        console.log('Error while fetching languages', e);
      },
    });
  };

  loadCards = () => {
    const {
      routeType,
      routeValue,
      routeTitle,
      isUserOnline,
      openSnackBar,
    } = this.props;
    const {
      languageValue,
      filter,
      showSkills,
      groupValue,
      modelValue,
      searchQuery,
      ratingRefine,
      entriesPerPage,
      languages,
      groups,
      orderBy,
    } = this.state;
    let url;

    if (routeType === 'category') {
      this.setState({
        groupValue: routeValue,
        text: routeTitle,
      });
      url =
        urls.API_URL +
        '/cms/getSkillList.json?group=' +
        routeValue +
        '&language=' +
        languageValue +
        '&applyFilter=true&filter_name=' +
        orderBy +
        '&filter_type=' +
        filter +
        showSkills;
    } else if (routeType === 'language') {
      this.setState({
        languageValue: routeValue,
        text: routeTitle,
      });
      url =
        urls.API_URL +
        '/cms/getSkillList.json?group=' +
        groupValue +
        '&applyFilter=true&language=' +
        routeValue +
        '&filter_name=' +
        orderBy +
        '&filter_type=' +
        filter +
        showSkills;
    } else if (languages.length > 0 && groups.length > 0) {
      // idhar hora h
      url =
        urls.API_URL +
        '/cms/getSkillList.json?model=' +
        modelValue +
        '&group=' +
        groupValue +
        '&language=' +
        languageValue +
        '&applyFilter=true&filter_name=' +
        orderBy +
        '&filter_type=' +
        filter +
        showSkills;
    } else {
      url =
        urls.API_URL +
        '/cms/getSkillList.json?group=All&applyFilter=true&filter_name=descending&filter_type=rating';
    }

    if (searchQuery.length > 0) {
      url = url + '&q=' + searchQuery;
    }
    $.ajax({
      url: url,
      dataType: 'jsonp',
      jsonp: 'callback',
      crossDomain: true,
      success: data => {
        if (ratingRefine) {
          data.filteredData = this.refineByRating(
            data.filteredData,
            ratingRefine,
          );
        }
        this.setState(
          {
            skills: data.filteredData,
            listSkills: data.filteredData.slice(0, entriesPerPage),
            // cards: cards,
            skillURL: url,
            skillsLoaded: true,
            listOffset: 0,
            listPage: 1,
            entriesPerPage: 10,
          },
          () => {
            this.loadLanguages();
          },
        );
      },
      error: e => {
        console.log('Error while fetching skills', e);
        if (isUserOnline) {
          this.loadCards();
        } else {
          openSnackBar({ snackBarMessage: 'Sorry! You are offline.' });
          this.setState({
            skillsLoaded: true,
          });
        }
      },
    });
  };

  loadMetricsSkills = () => {
    const { languageValue } = this.state;
    const { isUserOnline, openSnackBar } = this.props;
    let url;
    url =
      urls.API_URL + '/cms/getSkillMetricsData.json?language=' + languageValue;
    $.ajax({
      url: url,
      dataType: 'jsonp',
      jsonp: 'callback',
      crossDomain: true,
      success: data => {
        this.setState({
          skillsLoaded: true,
          staffPicksSkills: data.metrics.staffPicks,
          topRatedSkills: data.metrics.rating,
          topUsedSkills: data.metrics.usage,
          latestUpdatedSkills: data.metrics.latest,
          newestSkills: data.metrics.newest,
          topFeedbackSkills: data.metrics.feedback,
          topGames: data.metrics['Games, Trivia and Accessories'],
        });
      },
      error: e => {
        console.log('Error while fetching skills based on top metrics', e);
        if (isUserOnline) {
          this.loadMetricsSkills();
        } else {
          openSnackBar({ snackBarMessage: 'Sorry! You are offline.' });
          this.setState({
            skillsLoaded: true,
          });
        }
      },
    });
  };

  handleRatingRefine = ratingRefine => {
    const { skills } = this.state;
    const prevRatingRefine = this.state.ratingRefine;
    this.setState({ ratingRefine, skillsLoaded: false });
    if (
      (!prevRatingRefine || ratingRefine > prevRatingRefine) &&
      skills.length > 0
    ) {
      let refinedSkills = this.refineByRating(skills, ratingRefine);
      this.setState({
        skills: refinedSkills,
        skillsLoaded: true,
      });
    } else {
      this.loadCards();
    }
  };

  refineByRating = (skills, ratingRefine) => {
    return skills.filter(
      skill =>
        skill.skill_rating && skill.skill_rating.stars.avg_star >= ratingRefine,
    );
  };

  languageMenuItems = values => {
    return this.languages.map(name => (
      <MenuItem
        key={name}
        insetChildren={true}
        checked={values && values.indexOf(name) > -1}
        value={name}
        primaryText={
          ISO6391.getNativeName(name)
            ? ISO6391.getNativeName(name)
            : 'Universal'
        }
      />
    ));
  };

  pageMenuItems = values => {
    const { skills, entriesPerPage } = this.state;
    let menuItems = [];
    for (let i = 1; i <= Math.ceil(skills.length / entriesPerPage); i += 1) {
      menuItems.push(i);
    }
    return menuItems.map(menuItem => (
      <MenuItem
        key={menuItem}
        value={menuItem}
        primaryText={menuItem.toString()}
        label={menuItem.toString()}
      />
    ));
  };

  handleOrderByChange = () => {
    this.setState(
      prevState => ({
        orderBy: prevState.orderBy === 'ascending' ? 'descending' : 'ascending',
        skillsLoaded: false,
      }),
      () => {
        this.loadCards();
      },
    );
  };

  render() {
    const {
      languageValue,
      innerWidth,
      searchQuery,
      ratingRefine,
      timeFilter,
      skills,
      listOffset,
      entriesPerPage,
      showStaffPicks,
      showReviewedSkills,
      filter,
      viewType,
      skillsLoaded,
      modelValue,
      skillUrl,
      topRatedSkills,
      topUsedSkills,
      newestSkills,
      latestUpdatedSkills,
      topFeedbackSkills,
      topGames,
      listPage,
      listSkills,
      staffPicksSkills,
    } = this.state;
    const { routeType, routeValue } = this.props;
    let sidebarStyle = styles.sidebar;
    let topBarStyle = styles.topBar;
    let groupsMobile = null;
    let backToHome = null;

    let metricsContainerStyle = {
      width: '100%',
      margin: innerWidth >= 430 ? '10px' : '10px 0px 10px 0px',
    };

    if (innerWidth < 430) {
      sidebarStyle.display = 'none';
      topBarStyle.flexDirection = 'column';
      groupsMobile = this.groups;
      backToHome = (
        <MenuItem
          value="Back to SUSI Skills"
          key="Back to SUSI Skills"
          primaryText="Back to SUSI Skills"
          containerElement={<Link to="/" />}
          style={{ minHeight: '32px', textAlign: 'center', lineHeight: '32px' }}
        />
      );
    }
    if (innerWidth >= 430) {
      sidebarStyle.display = 'block';
      topBarStyle.flexDirection = 'row';
    }

    let metricsHidden =
      routeType || searchQuery.length > 0 || ratingRefine || timeFilter;

    let renderSkillCount = '';
    if (skills.length > 0) {
      renderSkillCount = (
        <div
          style={{
            display: 'flex',
          }}
        >
          {listOffset + 1}-{listOffset + entriesPerPage > skills.length
            ? skills.length
            : listOffset + entriesPerPage}{' '}
          out of {skills.length} result(s) for&nbsp;<b>
            <Link to="/">
              <div className="susi-skills">SUSI Skills</div>
            </Link>
          </b>
          {routeValue && (
            <div style={{ display: 'flex' }}>
              :&nbsp;<div style={{ color: '#4286f4', fontWeight: 'bold' }}>
                {routeValue}
              </div>
            </div>
          )}
          {searchQuery.length > 0 && (
            <div style={{ display: 'flex' }}>
              :&nbsp;<div style={{ color: '#4286f4', fontWeight: 'bold' }}>
                &quot;{searchQuery}&quot;
              </div>
            </div>
          )}
          {ratingRefine > 0 && (
            <div style={{ display: 'flex' }}>
              :&nbsp;<div style={{ color: '#4286f4', fontWeight: 'bold' }}>
                {ratingRefine} Stars & Up
              </div>
            </div>
          )}
          {timeFilter > 0 && (
            <div style={{ display: 'flex' }}>
              :&nbsp;<div style={{ fontWeight: 'bold' }}>
                Last {timeFilter} days
              </div>
            </div>
          )}
        </div>
      );
    } else if (searchQuery.length > 0) {
      renderSkillCount = (
        <div style={{ padding: '10px' }}>
          <h2 style={{ fontWeight: '400' }}>
            Your search <b>&quot;{searchQuery}&quot;</b> did not match any
            skills.
          </h2>
          <h3 style={{ margin: '15px 0 10px 0' }}>Try something like</h3>
          <ul style={{ listStyle: 'inside' }}>
            <li>Using more general terms</li>
            <li>Checking your spelling</li>
          </ul>
        </div>
      );
    } else {
      renderSkillCount = (
        <div>
          No result found for{' '}
          <b>
            <Link to="/">
              <span className="susi-skills">SUSI Skills: </span>
            </Link>
          </b>
          {routeValue && (
            <span style={{ color: '#4286f4', fontWeight: 'bold' }}>
              {routeValue}
            </span>
          )}
        </div>
      );
    }

    const skillCardListData = [
      {
        scrollId: 'staffPicks',
        skills: staffPicksSkills,
        heading: 'Staff Picks',
      },
      {
        scrollId: 'topRated',
        skills: topRatedSkills,
        heading: '"SUSI, what are your highest rated skills?"',
      },
      {
        scrollId: 'topUsed',
        skills: topUsedSkills,
        heading: '"SUSI, what are your most used skills?"',
      },
      {
        scrollId: 'newestSkills',
        skills: newestSkills,
        heading: '"SUSI, what are the newest skills?"',
      },
      {
        scrollId: 'latestUpdatedSkills',
        skills: latestUpdatedSkills,
        heading: '"SUSI, what are the recently updated skills?"',
      },
      {
        scrollId: 'topFeedback',
        skills: topFeedbackSkills,
        heading: '"SUSI, what are the skills with most feedback?"',
      },
      {
        scrollId: 'topGames',
        skills: topGames,
        heading: '"SUSI, what are your top games?"',
      },
    ];

    let renderCardScrollList = '';

    renderCardScrollList = skillCardListData.map(data => {
      return data.skills.length && !metricsHidden ? (
        <div style={metricsContainerStyle}>
          <div style={styles.metricsHeader} className="metrics-header">
            <h4>{data.heading}</h4>
          </div>
          {/* Scroll Id must be unique for all instances of SkillCardList*/}
          {!routeType && (
            <SkillCardScrollList
              scrollId={data.scrollId} // different
              skills={data.skills} // different
              modelValue={modelValue}
              languageValue={languageValue}
              skillUrl={skillUrl}
            />
          )}
        </div>
      ) : null;
    });

    let renderOrderBy = '';

    renderOrderBy =
      this.state.orderBy === 'ascending' ? (
        <NavigationArrowUpward />
      ) : (
        <NavigationArrowDownward />
      );

    return (
      <div style={styles.browseSkillRoot}>
        <StaticAppBar
          {...this.props}
          zDepth={1}
          toggleDrawer={this.handleDrawerToggle}
        />
        <div style={styles.main}>
          <div style={styles.sidebar}>
            <div style={styles.newSkillBtn}>
              <IconMenu
                style={{ width: '60%' }}
                animated={false}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'middle',
                }}
                iconButtonElement={
                  <RaisedButton
                    className="create-button"
                    style={{ width: '100%', height: 48 }}
                    buttonStyle={{
                      height: '48px',
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                    label="Create"
                    icon={<Add />}
                    backgroundColor="#4285f4"
                    labelStyle={{ color: '#fff' }}
                  />
                }
              >
                <Link to="/skillCreator">
                  <MenuItem leftIcon={<Add />} primaryText="Create a Skill" />
                </Link>
                <Link to="/botbuilder">
                  <MenuItem
                    leftIcon={<Person />}
                    primaryText="Create Skill bot"
                  />
                </Link>
              </IconMenu>
            </div>
            <Menu desktop={true} disableAutoFocus={true}>
              {timeFilter ? (
                <div className="category-sidebar-section">
                  <div
                    className="index-link-sidebar"
                    onClick={() => this.handleArrivalTimeChange(null)}
                  >
                    {'< Any release'}
                  </div>
                  <div style={styles.selectedFilterStyle}>
                    {`Last ${timeFilter} Days`}
                  </div>
                </div>
              ) : (
                <Subheader style={styles.sidebarSubheader}>
                  New Arrivals
                </Subheader>
              )}
              {!timeFilter && (
                <MenuItem
                  value="creation_date&duration=7"
                  key="Last 7 Days"
                  primaryText="Last 7 Days"
                  onClick={() => this.handleArrivalTimeChange(7)}
                  style={styles.sidebarMenuItem}
                />
              )}
              {!timeFilter && (
                <MenuItem
                  value="creation_date&duration=30"
                  key="Last 30 Days"
                  primaryText="Last 30 Days"
                  onClick={() => this.handleArrivalTimeChange(30)}
                  style={styles.sidebarMenuItem}
                />
              )}
              {!timeFilter && (
                <MenuItem
                  value="creation_date&duration=90"
                  key="Last 90 Days"
                  primaryText="Last 90 Days"
                  onClick={() => this.handleArrivalTimeChange(90)}
                  style={styles.sidebarMenuItem}
                />
              )}
              <Divider style={{ marginLeft: '16px', marginRight: '16px' }} />

              {routeType === 'category' ? (
                <div className="category-sidebar-section">
                  <Link to="/">
                    <div className="index-link-sidebar">{'< SUSI Skills'}</div>
                  </Link>
                  <div style={styles.selectedFilterStyle}>{routeValue}</div>
                </div>
              ) : (
                <div>
                  <Subheader style={styles.sidebarSubheader}>
                    SUSI Skills
                  </Subheader>
                  <div>{this.groups}</div>
                </div>
              )}

              <Divider style={{ marginLeft: '16px', marginRight: '16px' }} />
              {/* Refine by rating section*/}
              <Subheader style={styles.sidebarSubheader}>Refine by</Subheader>

              {metricsHidden && (
                <div
                  style={{
                    marginBottom: '12px',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    flexDirection: 'column',
                  }}
                >
                  <Checkbox
                    label="Staff Picks"
                    labelPosition="right"
                    className="select"
                    checked={showStaffPicks}
                    labelStyle={{ fontSize: '14px' }}
                    iconStyle={{ left: '4px' }}
                    style={styles.checkboxStyle}
                    onCheck={(event, isInputChecked) => {
                      this.handleShowSkills({ staffPicks: isInputChecked });
                    }}
                  />
                  <Checkbox
                    label="Show Only Reviewed Skills"
                    labelPosition="right"
                    className="select"
                    checked={showReviewedSkills}
                    labelStyle={{ fontSize: '14px' }}
                    iconStyle={{ left: '4px' }}
                    style={styles.checkboxStyle}
                    onCheck={(event, isInputChecked) => {
                      this.handleShowSkills({ reviewed: isInputChecked });
                    }}
                  />
                </div>
              )}

              <h4
                style={{
                  marginLeft: '24px',
                  marginBottom: '4px',
                  fontSize: 14,
                }}
              >
                Avg. Customer Review
              </h4>
              {ratingRefine ? (
                <div
                  className="clear-button"
                  style={styles.clearButton}
                  onClick={() => this.handleRatingRefine(null)}
                >
                  {'< Clear'}
                </div>
              ) : (
                ''
              )}
              <div style={styles.starRefine}>
                <SkillRating
                  handleRatingRefine={this.handleRatingRefine}
                  rating={4}
                  ratingRefine={ratingRefine}
                />
                <SkillRating
                  handleRatingRefine={this.handleRatingRefine}
                  rating={3}
                  ratingRefine={ratingRefine}
                />
                <SkillRating
                  handleRatingRefine={this.handleRatingRefine}
                  rating={2}
                  ratingRefine={ratingRefine}
                />
                <SkillRating
                  handleRatingRefine={this.handleRatingRefine}
                  rating={1}
                  ratingRefine={ratingRefine}
                />
              </div>
            </Menu>
          </div>
          <div style={styles.home}>
            <div style={styles.topBar} className="top-bar">
              <div style={styles.searchBar} className="search-bar">
                <SearchBar
                  onChange={_.debounce(this.handleSearch, 500)}
                  onRequestSearch={this.loadCards}
                  style={{
                    marginTop: '17px',
                  }}
                  value={searchQuery}
                />
              </div>
              {metricsHidden && (
                <div style={styles.sortBy}>
                  {this.state.filter !== '' && (
                    <IconButton
                      iconStyle={{ fill: '#4285F4' }}
                      onClick={this.handleOrderByChange}
                    >
                      {renderOrderBy}
                    </IconButton>
                  )}
                  <SelectField
                    floatingLabelText="Sort by"
                    value={filter}
                    floatingLabelFixed={false}
                    onChange={this.handleFilterChange}
                    style={styles.selection}
                    className="select"
                    // autoWidth
                    listStyle={{
                      top: '100px',
                    }}
                    selectedMenuItemStyle={{
                      color: colors.header,
                    }}
                    underlineFocusStyle={{
                      color: colors.header,
                    }}
                  >
                    <MenuItem
                      value={'lexicographical'}
                      key={'lexicographical'}
                      primaryText={'A-Z'}
                      label={'Name (A-Z)'}
                    />
                    <MenuItem
                      value={'rating'}
                      key={'rating'}
                      primaryText={'Top Rated'}
                      label={'Top Rated'}
                    />
                    <MenuItem
                      value={'creation_date'}
                      key={'creation_date'}
                      primaryText={'Newly created'}
                      label={'Newly Created'}
                    />
                    <MenuItem
                      value={'modified_date'}
                      key={'modified_date'}
                      primaryText={'Recently updated'}
                      label={'Recently updated'}
                    />
                    <MenuItem
                      value={'feedback'}
                      key={'feedback'}
                      primaryText={'Feedback Count'}
                      label={'Feedback Count'}
                    />
                    <MenuItem
                      value={'usage&duration=7'}
                      key={'usage&duration=7'}
                      primaryText={'This Week Usage'}
                      label={'This Week Usage'}
                    />
                    <MenuItem
                      value={'usage&duration=30'}
                      key={'usage&duration=30'}
                      primaryText={'This Month Usage'}
                      label={'This Month Usage'}
                    />
                  </SelectField>
                </div>
              )}
              <SelectField
                autoWidth
                floatingLabelText="Languages"
                floatingLabelFixed={false}
                style={styles.selection}
                listStyle={{
                  top: '100px',
                }}
                selectedMenuItemStyle={{
                  color: colors.header,
                }}
                underlineFocusStyle={{
                  color: colors.header,
                }}
                multiple={true}
                hintText="Languages"
                value={languageValue}
                onChange={this.handleLanguageChange}
              >
                {this.languageMenuItems(languageValue)}
              </SelectField>
              {metricsHidden && (
                <RadioButtonGroup
                  name="view_type"
                  defaultSelected="list"
                  style={
                    innerWidth < 430
                      ? {
                          right: 12,
                          position: 'absolute',
                          top: 216,
                          display: 'flex',
                        }
                      : { display: 'flex', marginTop: 34 }
                  }
                  valueSelected={viewType}
                  onChange={this.handleViewChange}
                >
                  <RadioButton
                    value="list"
                    label="List view"
                    labelStyle={{ display: 'none' }}
                    style={{ width: 'fit-content' }}
                    checkedIcon={
                      <ActionViewStream style={{ fill: '#4285f4' }} />
                    }
                    uncheckedIcon={
                      <ActionViewStream style={{ fill: '#e0e0e0' }} />
                    }
                  />
                  <RadioButton
                    value="grid"
                    label="Grid view"
                    labelStyle={{ display: 'none' }}
                    style={{ width: 'fit-content' }}
                    checkedIcon={
                      <ActionViewModule style={{ fill: '#4285f4' }} />
                    }
                    uncheckedIcon={
                      <ActionViewModule style={{ fill: '#e0e0e0' }} />
                    }
                  />
                </RadioButtonGroup>
              )}
            </div>
            {!skillsLoaded && (
              <div>
                <h1 style={styles.loader}>
                  <div className="center">
                    <CircularProgress size={62} color="#4285f5" />
                    <h4>Loading</h4>
                  </div>
                </h1>
              </div>
            )}

            {skillsLoaded ? (
              <div style={styles.container}>
                <div>{renderCardScrollList}</div>
                {metricsHidden ? (
                  <div>
                    <div id={'page-filter'}>
                      {renderSkillCount}
                      {skills.length > 10 && (
                        <div id={'pagination'}>
                          <SelectField
                            floatingLabelText="Skills per page"
                            floatingLabelFixed={false}
                            hintText="Entries per page"
                            style={{ width: '150px' }}
                            value={entriesPerPage}
                            onChange={this.handleEntriesPerPageChange}
                          >
                            <MenuItem
                              value={10}
                              key={10}
                              primaryText={'10'}
                              label={'10'}
                            />
                            <MenuItem
                              value={20}
                              key={20}
                              primaryText={'20'}
                              label={'20'}
                            />
                            <MenuItem
                              value={50}
                              key={50}
                              primaryText={'50'}
                              label={'50'}
                            />
                            <MenuItem
                              value={100}
                              key={100}
                              primaryText={'100'}
                              label={'100'}
                            />
                          </SelectField>
                          <SelectField
                            floatingLabelText="Page"
                            floatingLabelFixed={false}
                            hintText="Page"
                            style={{ width: '150px' }}
                            value={listPage}
                            onChange={this.handlePageChange}
                          >
                            {this.pageMenuItems()}
                          </SelectField>
                        </div>
                      )}
                    </div>
                    <div>
                      {viewType === 'list' ? (
                        <SkillCardList
                          skills={listSkills}
                          modelValue={modelValue}
                          languageValue={languageValue}
                          skillUrl={skillUrl}
                        />
                      ) : (
                        <SkillCardGrid
                          skills={listSkills}
                          modelValue={modelValue}
                          languageValue={languageValue}
                          skillUrl={skillUrl}
                        />
                      )}
                    </div>
                    {skills.length > 10 && (
                      <div className="pageNavigation">
                        <div className="pagination-test">
                          Page: {this.state.listPage} out of{' '}
                          {Math.ceil(skills.length / entriesPerPage)}
                        </div>
                        <FloatingActionButton
                          disabled={listPage === 1}
                          style={{ marginRight: '15px' }}
                          backgroundColor={colors.header}
                          onClick={this.handleNavigationBackward}
                        >
                          <NavigationArrowBack />
                        </FloatingActionButton>
                        <FloatingActionButton
                          disabled={
                            listPage ===
                            Math.ceil(skills.length / entriesPerPage)
                          }
                          backgroundColor={colors.header}
                          onClick={this.handleNavigationForward}
                        >
                          <NavigationArrowForward />
                        </FloatingActionButton>
                      </div>
                    )}
                  </div>
                ) : (
                  ''
                )}
                {/* Check if mobile view is currently active*/}
                <div className="category-mobile-section">
                  {routeType === 'category' ? backToHome : groupsMobile}
                </div>
              </div>
            ) : null}
          </div>
        </div>
        <Footer />
      </div>
    );
  }
}
