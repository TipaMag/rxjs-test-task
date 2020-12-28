import React, { useEffect, useState } from "react"
import './App.css'

import { Subject, combineLatest } from "rxjs"
import { map, auditTime } from "rxjs/operators"

import EventEmitter from "events"

const temperature = new EventEmitter()
const pressure = new EventEmitter()
const humidity = new EventEmitter()

const subject1$ = new Subject()
const subject2$ = new Subject()
const subject3$ = new Subject()

const randomDelay = (min, max) => Math.floor(Math.random() * (1 + max - min)) + min

const combine = combineLatest([subject1$, subject2$, subject3$]).pipe(
  map(x => {
    console.log(JSON.stringify(x))
    return x
  }),
  map((x) => {
    return {
      temp: x[0].delay > 1000 ? x[0].temp : "N / A",
      press: x[1].delay > 1000 ? x[1].press : "N / A",
      hum: x[2].delay > 1000 ? x[2].hum : "N / A"
    };
  }),
  auditTime(100)
)

temperature.on("temp", (temp) => subject1$.next({ temp: temp, delay: temp }))
pressure.on("press", (press) => subject2$.next({ press: press, delay: press }))
humidity.on("hum", (hum) => subject3$.next({ hum: hum, delay: hum }))

function tempEmitter() {
  let rand = randomDelay(100, 2000)
  setTimeout(() => {
    temperature.emit("temp", rand)
    tempEmitter()
  }, rand)
}
tempEmitter()

function pressEmitter() {
  let rand = randomDelay(100, 2000)
  setTimeout(() => {
    pressure.emit("press", rand)
    pressEmitter()
  }, rand)
}
pressEmitter()

function humEmitter() {
  let rand = randomDelay(100, 2000)
  setTimeout(() => {
    humidity.emit("hum", rand)
    humEmitter()
  }, rand)
}
humEmitter()



export const App = () => {
  const [state, setState] = useState({
    temp: 0,
    press: 0,
    hum: 0
  })

  useEffect(() => {
    let sub = combine.subscribe((x) => setState(x))
    return () => sub.unsubscribe()
  }, [])

  return (
    <div className="App">

      <div className="monitor">
        <div>temperature: <span> {state.temp}</span></div>
        <div>Air pressure: <span> {state.press}</span></div>
        <div>Humidity: <span> {state.hum}</span></div>
      </div>

    </div>
  )
}