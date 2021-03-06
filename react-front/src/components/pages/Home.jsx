import React, { Component, Fragment, Suspense, lazy }from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Table from './comments/Table';
import InputForm from "./comments/InputForm";
import Services from "./../../Services";
const Json = lazy(() => import('./comments/Json'));

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.handleFormat = this.handleFormat.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.state = {
      error: null,
      commentsOriginal: [],
      comments: [],
      format: 'table',
      isLoaded: false,
      searchCount: 0,
      searchInput: ''
    }
  }

  // загружаем данные
  componentDidMount = () => {
    const services = new Services();
    services.getComments().then((data) => {
      this.setState({
        commentsOriginal: data,
        comments: data,
        isLoaded: true
      });
    },
    (error) => {
      this.setState({
        isLoaded: true,
        error: error
      });
      console.log('ERROR: ', error);
    });
  }

  // выполняем поиск
  handleSearch = (search) => {
    search = search.toLowerCase();
    const commentsOriginal = this.state.commentsOriginal;
    this.setState({
      comments: commentsOriginal.filter(comment => {
        return (comment._source.name.toLowerCase().indexOf(search) !== -1) || (comment._source.email.toLowerCase().indexOf(search) !== -1);
      }),
      searchCount: search.length,
      searchInput: search
    });
  }

  //ставим формат вывода - таблица/json
  handleFormat(format) {
    this.setState({ format: format });
  }

  render() {
    const { error, isLoaded, comments, format, searchCount, searchInput } = this.state;

    const err = error ? <div className="error">Ошибка загрузки данных</div> : null;
    const spinner = !isLoaded ? <FontAwesomeIcon icon="spinner" spin /> : null;
    const content = (format === 'table')
      ? <Table comments = { comments } searchCount = { searchCount } searchInput = { searchInput } />
      : <Suspense fallback={<div>Загрузка...</div>}><Json comments={comments} /></Suspense>

    const contentResult = (!error && isLoaded) ? content : spinner;


    return (
      <Fragment>
        <h1>Search comments</h1>
        <InputForm
          onSearch={this.handleSearch}
          onFormat={this.handleFormat}
          format={format}
        />
        { err }
        { contentResult }
      </Fragment>
    );
  }
}
