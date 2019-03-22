# Changelog
All notable changes to this project will be documented in this file.

## [Released]

## [1.2.3] - 2019-03-21
### Fix
- Better order cancel error messaging

## [1.2.2] - 2019-03-20
### Fix
- Fixed major bug. Prevent cycling error on order cancel

## [1.2.1] - 2019-03-18
### Fix
- Order set fee bug fix

## [1.2.0] - 2019-03-18
### Feature
- Order remaining and fee attributes

## [1.1.3] - 2019-03-17
### Fix
- Fixed erroneous emitter in exchange on socket error

## [1.1.2] - 2019-03-15
### Fix
- Accept REJECTED as a valid order status

## [1.1.1] - 2019-03-15
### Fix
- Update gdax-l2-orderbook for socket reset bug fix

## [1.1.0] - 2019-03-14
### Fix
- Made broker error management more comprehensive

## [1.0.18] - 2019-03-14
### Fix
- Reverting silly code that breaks things

## [1.0.17] - 2019-03-12
### Fix
- Prevent order sizes less than product base min size

## [1.0.16] - 2019-03-12
### Fix
- Bump gdax-l2-orderbook for a socket reset bugfix

## [1.0.15] - 2019-03-11
### Fix
- Updated socket reconnect event reassignment
- Bumped gdax-l2-orderbook

## [1.0.14] - 2019-03-10
### Feature
- Reset REJECTED orders to CREATED to ensure the broker keeps it alive

## [1.0.13] - 2019-03-10
### Feature
- Set order to canceled if post_only rejects it

## [1.0.12] - 2019-03-09
### Feature
- Better logging on order cancels

## [1.0.11] - 2019-03-06
### Feature
- Bail out of promise chain when cancel order fails

## [1.0.10] - 2019-03-06
### Feature
- Better error handling
- Update gdax-l2-orderbook dependency for better error handling

## [1.0.9] - 2019-03-02
### Feature
- Update L2 orderbook module dependency

## [1.0.8] - 2019-03-02
### Feature
- Updated error logging

## [1.0.7] - 2019-02-27
### Feature
- Made all orders `post_only` orders that will only execute as market-making

## [1.0.6] - 2019-02-25
### Feature
- Support 'canceled' event in addition to 'cancelled'

## [1.0.5] - 2019-02-24
### Feature
- Updated README

## [1.0.4] - 2019-02-24
### Fix
- Update gdax-l2-orderbook for websocket stability

## [1.0.3] - 2019-02-24
### Fix
- Websocket reconnect logic on connection errors

## [1.0.2] - 2019-02-23
### Fix
- Defensive code around filled order handler to not inspect queue if there is no queue

## [1.0.1] - 2019-02-21
### Fix
- Fixed partial order not updating bug

## [1.0.0] - 2019-02-21
### Feature
- Readme for official first release

## [0.1.0] - 2019-02-20
### Feature
- Broker filled order handling
### Fixed
- Multiple order placement bug 

## [0.0.3] - 2019-02-19
### Feature
- Broker queue and handlers
- Order execution

## [0.0.2] - 2019-02-18
### Feature
- Order data model with update behaviors
- Exchange place and cancel order methods for execution

## [0.0.1] - 2019-02-18
### Feature
- Initial exchange implementation
