import "./Header.css"
const Header = () => {
	return (
		<div className="banner">
			<div className="header-items">
				<img alt="world-logo" className="banner-img" style = {{width:"50px"}} src={`${process.env.PUBLIC_URL}/virus.svg`} />
				<h2 className='title'>USA Coronavirus Contextualizer</h2>
			</div>
		</div>
	)
}
export default Header