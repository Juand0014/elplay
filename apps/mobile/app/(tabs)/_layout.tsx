import { Tabs }       from 'expo-router'
import { Ionicons }   from '@expo/vector-icons'
import { COLORS, FONTS } from '@elplay/shared/types'

type IoniconsName = React.ComponentProps<typeof Ionicons>['name']

interface TabIconProps {
  name:    IoniconsName
  focused: boolean
  color:   string
}

function TabIcon({ name, focused, color }: TabIconProps) {
  return (
    <Ionicons
      name={focused ? name : (`${name}-outline` as IoniconsName)}
      size={24}
      color={color}
    />
  )
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown:     false,
        tabBarStyle: {
          backgroundColor:  COLORS.SURFACE,
          borderTopColor:   COLORS.BORDER,
          borderTopWidth:   1,
          height:           60,
          paddingBottom:    8,
        },
        tabBarActiveTintColor:   COLORS.PRIMARY,
        tabBarInactiveTintColor: COLORS.TEXT3,
        tabBarLabelStyle: {
          fontFamily: FONTS.BODY,
          fontSize:   10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title:    'Inicio',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="home" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="live"
        options={{
          title:    'En Vivo',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="radio" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ligas"
        options={{
          title:    'Ligas',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="trophy" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="apuntes"
        options={{
          title:    'Apuntes',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="document-text" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title:    'Perfil',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="person" focused={focused} color={color} />
          ),
        }}
      />
    </Tabs>
  )
}
