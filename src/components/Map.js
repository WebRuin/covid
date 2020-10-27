import React, { memo, useEffect, useState } from 'react';
import { geoCentroid } from 'd3-geo';
import styled from 'styled-components';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Annotation
} from 'react-simple-maps';

// Components
import Card from './Card';

// Data
import allStates from './data/allstates.json';

// Map
const geoUrl = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

const offsets = {
  VT: [50, -8],
  NH: [34, 2],
  MA: [30, -1],
  RI: [28, 2],
  CT: [35, 10],
  NJ: [34, 1],
  DE: [33, 0],
  MD: [47, 10],
  DC: [49, 21]
};

const Wrapper = styled.div`
  display: grid;
  gap: 1rem;
  grid-template-columns: 350px auto;

  .map {
    margin-top: -70px;
    margin-left: 40px;
  }

  @media only screen and (max-width: 992px) {
    display: block;

    .map {
      margin-top: 0px;
    }
  }
`;

const DashBoard = styled.div`
  width: 350px;
  height: 20vh;
  display: grid;
  gap: 1rem;
  grid-template-columns: 400px 1fr;

  @media only screen and (max-width: 1024px) {
    display: flex;
    justify-content: center;
    text-align: center;

    width: auto;
    height: auto;
  }

  @media only screen and (max-width: 576px) {
    display: block;
    margin-left: 5%;
    max-width: 450px;
  }
`;

const Map = () => {
  const [state, setState] = useState('Oregon');
  const [states, setStates] = useState([]);
  const [stateData, setData] = useState(undefined);
  const [gradColor, setGradColor] = useState('var(--green)');

  useEffect(() => {
    fetchState(state);
    fetchStates();
  }, [state]);

  async function fetchState(state) {
    const response = await fetch(
      `https://disease.sh/v3/covid-19/states/${state}`
    );
    const data = await response.json();
    setData(data);
  }

  async function fetchStates() {
    const response = await fetch(`https://disease.sh/v3/covid-19/states`);
    const data = await response.json();
    setStates(data);
  }

  // Set the body background overlay color depending on the number COVID related deaths today
  function handleGradColor(name) {
    console.log(name);
    let theState = states.find((state) => state.state === name);
    let data = { ...theState };
    console.log(data.todayDeaths);
    if (data.todayDeaths >= 60) {
      setGradColor('var(--red-15)');
    } else if (data.todayDeaths >= 30 && data.todayDeaths < 60) {
      setGradColor('var(--yellow-15)');
    } else if (data.todayDeaths < 30) {
      setGradColor('var(--green-15)');
    }
    console.log(gradColor);
    document.querySelector(':root').style.setProperty('--grad', `${gradColor}`);
  }

  function handleColor(name) {
    let theState = states.find((state) => state.state === name);
    let data = { ...theState };
    if (data.todayDeaths >= 60) {
      return 'var(--red)';
    }
    if (data.todayDeaths >= 30) {
      return 'var(--yellow)';
    }
    return 'var(--green)';
  }

  return (
    <Wrapper>
      <DashBoard>{stateData ? <Card stateData={stateData} /> : null}</DashBoard>
      <div className="map">
        <ComposableMap projection="geoAlbersUsa">
          <Geographies geography={geoUrl}>
            {({ geographies }) => (
              <>
                {geographies.map((geo) => {
                  let fillColor = handleColor(geo.properties.name);
                  return (
                    <Geography
                      key={geo.rsmKey}
                      stroke="#FFF"
                      geography={geo}
                      fill={fillColor}
                    />
                  );
                })}
                {geographies.map((geo) => {
                  const centroid = geoCentroid(geo);
                  const cur = allStates.find((s) => s.val === geo.id);
                  return (
                    <g key={geo.rsmKey + '-name'}>
                      {cur &&
                        centroid[0] > -160 &&
                        centroid[0] < -67 &&
                        (Object.keys(offsets).indexOf(cur.id) === -1 ? (
                          <Marker
                            onMouseOver={() => {
                              handleGradColor(cur.state);
                              setState(cur.state);
                            }}
                            coordinates={centroid}
                          >
                            <text
                              stroke="transparent"
                              fill="#efe"
                              y="2"
                              fontSize={14}
                              textAnchor="middle"
                            >
                              {cur.id}
                            </text>
                          </Marker>
                        ) : (
                          <Annotation
                            subject={centroid}
                            dx={offsets[cur.id][0]}
                            dy={offsets[cur.id][1]}
                          >
                            <text
                              onMouseOver={() => setState(cur.state)}
                              stroke="transparent"
                              fill="#efe"
                              x={4}
                              fontSize={14}
                              alignmentBaseline="middle"
                            >
                              {cur.id}
                            </text>
                          </Annotation>
                        ))}
                    </g>
                  );
                })}
              </>
            )}
          </Geographies>
        </ComposableMap>
      </div>
    </Wrapper>
  );
};

export default memo(Map);
