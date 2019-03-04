import React, { Component } from "react";
import { View, StyleSheet, Text, ScrollView, FlatList, SectionList, TouchableOpacity } from "react-native";
import { Icon, ListItem } from "react-native-elements";
import { NavigationActions } from 'react-navigation';
import PropTypes from 'prop-types';
import DrawerHeader from '../components/DrawerHeader';
import { connect } from 'react-redux';
import { 
  setActiveCoin, 
  setActiveApp, 
  setActiveSection, 
  signOut,
  setConfigSection
 } from '../actions/actionCreators'
import { getKeyByValue } from '../utils/objectManip'

const APP_INFO = 'App Info'
const PROFILE = 'Profile'

class SideMenu extends Component {
  constructor(props) {
    super(props)
    this.state = {          
      error: null,   
      mainDrawer: true, 
      currentCoinIndex: null,
    };
  }

  navigateToScreen = (route) => {
    let navigation = this.props.navigation

    navigation.navigate(route);
  }

  _openWallet = (coinID) => {  
    let navigation = this.props.navigation  
    navigation.navigate("Wallet", { 
      coin: coinID
    });
  };

  _openCoin = (coinObj, screen, section) => {
    let navigation = this.props.navigation 
    let sectionName = getKeyByValue(section, coinObj.apps)
    let index = 0;
    
    while (
      index < coinObj.apps[sectionName].data.length && 
      coinObj.apps[sectionName].data[index].name !== screen) {
       index++;     
    }

    if (index >= coinObj.apps[sectionName].data.length) {
      throw "Array out of bounds error at _openCoin in SideMenu.js"
    }

    this.props.dispatch(setActiveCoin(coinObj))
    this.props.dispatch(setActiveApp(sectionName))
    this.props.dispatch(setActiveSection(coinObj.apps[sectionName].data[index]))
    navigation.navigate("CoinMenus", { title: screen })
  }

  renderMainDrawerComponents = () => {
    return (
      <FlatList 
      style={styles.coinList}         
      data={this.props.activeCoinsForUser}    
      scrollEnabled={false}
      renderItem={({ item, index }) => ( 
        <ListItem              
          roundAvatar          
          title={item.id}                           
          avatar={item.logo}   
          containerStyle={{ borderBottomWidth: 0 }} 
          onPress={() => this.setState({ mainDrawer: false, currentCoinIndex: index })}
        />          
      )}          
      keyExtractor={item => item.id}                            
      /> 
    )
  }

  renderChildDrawerComponents = () => {
    return (
      <SectionList
      style={styles.coinList}
      renderItem={({item, index, section}) => (
        <ListItem                        
        title={item.name}     
        leftIcon={{name: item.icon}}                        
        containerStyle={{ borderBottomWidth: 0 }} 
        onPress={() => {this._openCoin(this.props.activeCoinsForUser[this.state.currentCoinIndex], item.name, section)}}
      /> 
      )}
      renderSectionHeader={({section: {title}}) => (
        <ListItem                        
        title={<Text style={{fontWeight: "bold"}}>{title}</Text>}                             
        containerStyle={{ backgroundColor: "#E9F1F7", borderBottomWidth: 0 }} 
        hideChevron={true}
        onPress={() => {return 0}}
        /> 
      )}
      sections={this.sectionExtractor(this.state.currentCoinIndex)}
      keyExtractor={(item, index) => item + index}
      />
    )
  }

  sectionExtractor = (currentCoinIndex) => {
    let sections = []
    let coinApps = this.props.activeCoinsForUser[currentCoinIndex].apps
    for (let key in coinApps) {
      sections.push(coinApps[key])
    }

    return sections
  }

  handleLogout = () => {
    this.props.dispatch(signOut())
  }

  _openSettings = (drawerItem) => {
    let navigation = this.props.navigation
    if (drawerItem.title === APP_INFO) {
      this.props.dispatch(setConfigSection('settings-info'))
    } else if (drawerItem.title === PROFILE){
      this.props.dispatch(setConfigSection('settings-profile'))
    } else {
      throw "Option " + drawerItem.title + " not found in possible settings values"
    }

    navigation.navigate("SettingsMenus", { title: drawerItem.title })
  }

  renderAddCoinComponents = () => {
    return (
      <SectionList
      style={styles.coinList}
      renderItem={({item, index, section}) => (
        <ListItem                        
        title={item}                             
        containerStyle={{ borderBottomWidth: 0 }} 
        onPress={item === 'Add coin from list' ? () => this.navigateToScreen('AddCoin') : () => {return 0}}
        /> 
      )}
      renderSectionHeader={({section: {title}}) => (
        <ListItem                        
        title={<Text style={{fontWeight: "bold"}}>{title}</Text>}                             
        containerStyle={{ backgroundColor: "#E9F1F7", borderBottomWidth: 0 }} 
        hideChevron={true}
        /> 
      )}
      sections={[
        {title: 'Add Coin', data: ['Add coin from list'/*, 'Add custom coin'*/]},
      ]}
      keyExtractor={(item, index) => item + index}
      />
    )
  }

  renderSettingsComponents = () => {
    return (
      <SectionList
      style={styles.coinList}
      renderItem={({item, index, section}) => (
        <ListItem    
        leftIcon={{name: item.icon}}                    
        title={item.title}                             
        containerStyle={{ borderBottomWidth: 0 }} 
        onPress={() => this._openSettings(item)}
        /> 
      )}
      renderSectionHeader={({section: {title}}) => (
        <ListItem                        
        title={<Text style={{fontWeight: "bold"}}>{title}</Text>}                             
        containerStyle={{ backgroundColor: "#E9F1F7", borderBottomWidth: 0 }} 
        hideChevron={true}
        /> 
      )}
      sections={[
        {title: 'Settings', 
        data: [
          {title: PROFILE, icon: "account-circle"},
          {title: APP_INFO, icon: "info"}
        ]},
      ]}
      keyExtractor={(item, index) => item + index}
      />
    )
  }

  toggleMainDrawer = () =>
		this.setState(prevState => ({ mainDrawer: !prevState.mainDrawer }));

  render() {
    if (this.state.mainDrawer) {
      return (
        <ScrollView>
					<DrawerHeader navigateToScreen={this.navigateToScreen} />
          {this.renderMainDrawerComponents()}
          <ListItem    
          roundAvatar                    
          title={"Add Coin"}                           
          avatar={require('../images/customIcons/addCoin.png')}
          containerStyle={{ borderBottomWidth: 0 }} 
          onPress={() => this.setState({ mainDrawer: false, currentCoinIndex: -1 })}
          /> 
          <ListItem    
          roundAvatar                    
          title={"Settings"}                           
          leftIcon={{name: 'settings'}}
          containerStyle={{ borderBottomWidth: 0 }} 
          onPress={() => this.setState({ mainDrawer: false, currentCoinIndex: -2 })}
          />
          <ListItem    
          roundAvatar                    
          title={"Log Out"}                           
          leftIcon={{name: 'exit-to-app'}}
          containerStyle={{ borderBottomWidth: 0 }} 
          onPress={this.handleLogout}
          /> 
				</ScrollView>
      );
    } 

    return (
      <ScrollView>
        <View>
          <DrawerHeader navigateToScreen={this.navigateToScreen} />
            <ListItem                        
            title={<Text style={{fontWeight: "bold"}}>{"Back"}</Text>}                             
            containerStyle={{ borderBottomWidth: 0 }} 
            hideChevron={true}
            leftIcon={
              <Icon
							name="arrow-back"
							size={25}
							color="#666666"
						  />
            }
            onPress={this.toggleMainDrawer}
            /> 
          {this.state.currentCoinIndex === -1 ? 
            this.renderAddCoinComponents() 
            : 
            this.state.currentCoinIndex === -2 ? 
              this.renderSettingsComponents()
              :
              this.renderChildDrawerComponents()}
        </View>
      </ScrollView>
    );
  }
}

SideMenu.propTypes = {
  navigation: PropTypes.object
};

const mapStateToProps = (state) => {
  return {
    activeCoinsForUser: state.coins.activeCoinsForUser,
    activeAccount: state.authentication.activeAccount,
    balances: state.ledger.balances,
  }
};

export default connect(mapStateToProps)(SideMenu);

const styles = StyleSheet.create({
  /*homeBox: {
    height: 67,
    width: 361,
  },
  homeButton: {
    top: 0,
    left: 0,
    width: "100%",
    position: "absolute",
    elevation: 0,
    borderRadius: 0,
    shadowColor: "#E9F1F7",
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 1,
    shadowRadius: 0
  },
  homeLabel: {
    top: 21,
    left: 22,
    width: 104,
    position: "absolute",
    backgroundColor: "transparent",
    fontSize: 25,
    color: "#E9F1F7"
  },
  menuBox: {
    height: 68,
    width: 361,
    marginTop: 70,
    backgroundColor: "#E9F1F7",
  },
  menuButton: {
    top: 0,
    left: 0,
    width: "100%",
    position: "absolute",
    elevation: 0,
    borderRadius: 0,
    shadowColor: "#E9F1F7",
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 1,
    shadowRadius: 0
  },
  menuLabel: {
    top: 21,
    left: 22,
    width: 104,
    position: "absolute",
    backgroundColor: "transparent",
    fontSize: 25,
    color: "#E9F1F7"
  },
  addCoinBox: {
    width: 361,
    height: 67
  },
  addCoinButton: {
    top: 0,
    left: 0,
    width: "100%",
    position: "absolute",
    elevation: 0,
    borderRadius: 0,
    shadowColor: "#E9F1F7",
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 1,
    shadowRadius: 0
  },
  addCoinLabel: {
    top: 21,
    left: 22,
    width: 104,
    position: "absolute",
    backgroundColor: "transparent",
    fontSize: 25,
    color: "#E9F1F7"
  },
  pollingBox: {
    width: 361,
    height: 67
  },
  pollingButton: {
    top: 0,
    left: 0,
    width: "100%",
    position: "absolute",
    elevation: 0,
    borderRadius: 0,
    shadowColor: "#E9F1F7",
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 1,
    shadowRadius: 0
  },
  pollingLabel: {
    top: 21,
    left: 22,
    width: 104,
    position: "absolute",
    backgroundColor: "transparent",
    fontSize: 25,
    color: "#E9F1F7"
  },
  settingsBox: {
    width: 361,
    height: 67
  },
  settingsButton: {
    top: 0,
    left: 0,
    width: "100%",
    position: "absolute",
    elevation: 0,
    borderRadius: 0,
    shadowColor: "#E9F1F7",
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 1,
    shadowRadius: 0
  },
  settingsLabel: {
    top: 21,
    left: 22,
    width: 104,
    position: "absolute",
    backgroundColor: "transparent",
    fontSize: 25,
    color: "#E9F1F7"
  },
  listPlaceholder: {
    height: 404.67,
    width: 361,
    backgroundColor: "#E9F1F7",
    opacity: 1
  },
  rect: {
    height: 1,
    width: 360,
    backgroundColor: "rgb(230,230,230)"
  },*/
  coinList: {
    width: "100%",
  },
  /*
  backButtonRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingBottom: 17,
		paddingLeft: 3,
		borderBottomColor: '#F0F0F0',
		borderBottomWidth: 1,
  },
  */
});