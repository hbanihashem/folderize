import React, { Component } from 'react';
import Lazyload from 'react-lazy-load';

// --------------------------- WIDGET PAGE COMPONENT --------------------------- //
class Page extends Component {
	constructor(props) {
		super(props);
		this.getOffset = this.getOffset.bind(this);
		this.state = {
			title: props.data.title,
			nodes: [],
			show: false,
			backgroundColor: '',
			backgroundImg: ''
		};
	}
	// ----------------------- LIFECYCLE METHODS ----------------------- //

	// ON MOUNT, MOVE DATA TO STATE
	componentDidMount() {
		// this.setState({ data: this.props.data });

		document.removeEventListener('after.lory.slide', this.getOffset.bind(this));
		document.addEventListener('after.lory.slide', this.getOffset.bind(this));
	}

	componentWillUnmount() {
		document.removeEventListener('after.lory.slide', this.getOffset);
	}

	// ------------------------- DATA HANDLING ------------------------- //

	// PLUGIN NAVIGATION HANDLER
	pluginNav(node) {
		buildfire.navigation.navigateTo({
			pluginId: node.data.pluginTypeId,
			instanceId: node.data.instanceId,
			folderName: node.data._buildfire.pluginType.result[0].folderName,
			title: node.data.title
		});
	}
	// CROPS IMAGES BASED ON LAYOUT
	cropImg(image, isAction) {
		if (!image) return;
		let cropped;
		let options = {};
		if (isAction) {
			let layout = this.props.layout;

			if (layout === 0) {
				options.width = 50;
				options.height = 50;
			}
			if (layout === 1) {
				options.width = 50;
				options.height = 50;
			}
			if (layout === 2) {
				options.width = window.innerWidth;
				options.height = options.width * 0.54;
			}
			if (layout === 4) {
				options.width = window.innerWidth;
				options.height = window.innerHeight * 0.3;
			}
			if (layout === 3) {
				options.width = window.innerWidth;
				options.height = options.width * 0.235;
			}
			if (layout === 5) {
				options.width = window.innerWidth;
				options.height = options.width * 0.41;
			}
			
			
			cropped = buildfire.imageLib.cropImage(image, options);
		} else {
			options.width = window.innerWidth;
			options.height = options.width * 0.54;
			cropped = buildfire.imageLib.cropImage(image, options);
		}
		return cropped;
	}
	// HORIZONTAL LAZY LOADING FOR PAGES
	getOffset() {
		setTimeout(() => {
			//
			let slide = document.querySelector(`#slide${this.props.index}`);
			if (!slide) return;
			let x = slide.getBoundingClientRect().x;
			//
			this.setState({
				offset: Math.abs(x)
			});
		}, 250);
	}

	// -------------------------- RENDERING -------------------------- //

	// LOOPS THROUGH THE NODES AND RETURNS ELEMENTS OF THE CORRESPONDING TYPE
	renderNodes() {
		let nodes = [];
		if (!this.props.data.nodes) return;
		this.props.data.nodes.forEach(node => {
			if (!node) return;
			switch (node.type) {
				case 'header': {
					let border;
					node.data.border ? (border = '') : (border = `border-bottom: 0px !important;`);
					nodes.push(
						// <div className={`col-sm-12  node-layout${node.data.layout}`}>
						<div className="col-sm-12">
							<div className="page-header" style={border}>
								<h1>{node.data.text}</h1>
							</div>
						</div>
					);
					break;
				}
				case 'desc': {
					nodes.push(
						<div className="col-sm-12">
							<p className="description">{node.data.text}</p>
						</div>
					);
					break;
				}
				case 'image': {
					if (node.format === 'hero') {
						nodes.push(
							<div className="col-sm-12">
								<div className="hero">
									<div className="hero-img" style={`background: url("${node.data.src}")`} alt="...">
										<div className="hero-text">
											<h1>{node.data.header}</h1>
											{node.data.subtext.length > 0 ? <p>{node.data.subtext}</p> : null}
										</div>
									</div>
									{/* <h3 className="plugin-title">{node.data.title}</h3> */}
								</div>
							</div>
						);
					} else {
						nodes.push(
							<div className="col-sm-12">
								<div className="image-wrap">
									<Lazyload offsetHorizontal={50} height={window.innerWidth * 0.54}>
										<div className="images" style={`background: url(${this.cropImg(node.data.src, false)})`} />
									</Lazyload>
								</div>
							</div>
						);
					}
					break;
				}
				case 'plugin': {
					if (!node.data) return;
					nodes.push(
						<div className="col-sm-12">
							<div className="plugin" onClick={e => this.pluginNav(node)}>
								<div className="plugin-thumbnail" style={`background: url("${node.data.iconUrl}")`} alt="..." />
								<h3 className="plugin-title">{node.data.title}</h3>
							</div>
						</div>
					);
					break;
				}
				case 'action': {
					if (!node.data) return;
					let croppedImg = this.cropImg(node.data.iconUrl, true);
					nodes.push(
						<div className="col-sm-12">
							<div
								className="plugin"
								onClick={e => {
									buildfire.actionItems.execute(node.data, (err, res) => {
										if (err) throw err;
									});
								}}>
								<img className="plugin-thumbnail" src={`${croppedImg}`} alt="..." />
								<h3 className="plugin-title">{node.data.title}</h3>
							</div>
						</div>
					);
					break;
				}
				case 'hero': {
					if (!node.data) return;
					nodes.push(
						<div className="col-sm-12">
							<div className="hero">
								<div className="hero-img" style={`background: url("${node.data.src}")`} alt="...">
									<div className="hero-text">
										<h1>{node.data.header}</h1>
										{node.data.subtext.length > 0 ? <p>{node.data.subtext}</p> : null}
									</div>
								</div>
								{/* <h3 className="plugin-title">{node.data.title}</h3> */}
							</div>
						</div>
					);
					break;
				}
				default:
					return;
			}
		});
		return nodes;
	}

	render() {
		let content = (
			<div className="container-fluid page-content" style={`${this.props.data.backgroundColor} !important`}>
				<div className="row">{this.renderNodes()}</div>
			</div>
		);
		return (
			<li className="js_slide" index={this.props.index} id={`slide${this.props.index}`} style={this.props.data.backgroundImg ? `background: url("${this.props.data.backgroundImg}")` : null}>
				{/* if the page is not next up or not currently in the viewport, dont render its content */}
				{this.state.offset > window.innerWidth + 100 ? null : content}
			</li>
		);
	}
}

export default Page;
